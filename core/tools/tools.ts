import { executeCommand } from "./toolFunctions";
import { CommandResult, DependencyType, ParamsType } from "../types";
import { AgentType } from "../agents";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';


const TerminalParamsSchema = z.object({
  dependencies: z.array(
    z.object({
      package: z.string(),
      version: z.string()
    })
  )
});

type TerminalParams = z.infer<typeof TerminalParamsSchema>;

async function UseTerminal(params: Record<string, any>): Promise<{status: "200"|"400"|"500", message: string}> {
    // Validate and transform the input
    const validatedParams = TerminalParamsSchema.parse(params);
    const dependencies = validatedParams.dependencies;
    
    const command = `npm install ${dependencies.map(dep => `${dep.package}@${dep.version}`).join(" ")}`;
    const result: CommandResult = await executeCommand(command);
    
    return {
        status: result.stderr ? "500" : "200",
        message: result.stderr || result.stdout
    };
}

async function FindAgentByDes(description: string): Promise<AgentType> {
    "use server";
    console.log(`Description: ${description}`);

    const agentsJsonPath = path.join(__dirname, './core/memory/code/agents.jsonc')
    const agentsJson = fs.readFileSync(agentsJsonPath, 'utf-8');
    const agents = JSON.parse(agentsJson) as {id: string; name: string; description: string;}[];
    const agentMetadata = agents.find(agent => agent.description.includes(description));

    if (!agentMetadata) {
        throw new Error(`Agent with description ${description} not found`);
    }

    const functionDefinitionsPath = path.join(__dirname, '../memory/code/functionDumps', `${agentMetadata.id}.ts`); // Adjust path
    const functionDefinitions = await import(functionDefinitionsPath);

    const agent: AgentType = {
        id: agentMetadata.id,
        name: agentMetadata.name,
        description: agentMetadata.description,
        actions: Object.entries(functionDefinitions.actions).map(([name, func]) => ({
            name: name,
            type: "Execution", // Or determine dynamically
            description: `Description for ${name}`, // Add descriptions
            params: {}, // Add params schema
            handlerKey: `${name}_handler`
        }))
    };

    return agent;
}


export { UseTerminal, FindAgentByDes, TerminalParamsSchema };