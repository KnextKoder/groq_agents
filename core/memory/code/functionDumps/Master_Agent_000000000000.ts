// MasterAgent_00000000000000000000.ts
import { Logger } from "../../../utils";
import {CommandResult, FindAgentParamsSchema, ResponseParamsSchema} from "../../../types";
import { AgentType } from "../../../agents";
import { spawn } from "child_process";
import { TerminalParamsSchema } from "../agentDumps/Master_Agent_000000000000";


async function executeCommand(command:string): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
        // Validate the command
        const allowedCommands = ['bun install', 'npm install'];
        if (!allowedCommands.includes(command)) {
            reject(new Error('Command not allowed'));
            return;
        }

        // Spawn the process
        const args = command.split(' ');
        const process = spawn(args[0], args.slice(1));

        // Buffers to accumulate stdout and stderr
        let stdout = '';
        let stderr = '';

        // Handle stdout data
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // Handle stderr data
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process completion
        process.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
            } else {
                resolve({ stdout: stdout.trim(), stderr: `${stderr.trim()}` });
            }
        });

        // Handle process errors
        process.on('error', (err) => {
            reject({ stdout: '', stderr: err.message });
        });
    });
}


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


const useTerminal_handler = async (params: Record<string, any>) => {
    const validatedParams = TerminalParamsSchema.parse(params);
    Logger("Tool", `UseTerminal Tool called`, true);
    Logger("Tool", `UseTerminal Params: ${JSON.stringify(validatedParams)}`, true);
    return await UseTerminal(validatedParams);
};


const findAgent_handler = async (params: Record<string, any>) => {
    const validatedParams = FindAgentParamsSchema.parse(params);
    Logger("Tool", `findAgent Tool called`, true);
    Logger("Tool", `findAgent Params: ${JSON.stringify(validatedParams)}`, true);
    
    const agent = await FindAgentByDesc(validatedParams.description);
    
    return {
        status: "200",
        responseBody: { agent: agent }
    };
};


const response_handler = async (params: Record<string, any>) => {
    const validatedParams = ResponseParamsSchema.parse(params);
    Logger("Tool", `Response Tool called`, true);
    Logger("Tool", `Response Tool Params: ${JSON.stringify(validatedParams)}`, true);
    Logger("Tool", `Response Tool Response: ${JSON.stringify(validatedParams.response)}`, true);
    return {
        status: "200",
        other: validatedParams.response
    };
};


async function FindAgentByDesc(description:string): Promise<AgentType> {
    Logger("Tool",`FindAgentByDesc called with description: ${description}`, true);
    const agent:AgentType = {
        id: "238595071",
        name: "X Agent",
        description: "Agent that interfaces with the X social media platform",
        actions: [
            {
                name: "like_post",
                type: "Execution",
                description: "Like a post on the X social media platform",
                params: {},
                handlerKey: "like_post_handler"
            }
        ]
    }
    Logger("Tool", `FindAgentByDesc Response: ${JSON.stringify(agent)}`, true);
    
    return agent;
}

export { executeCommand, FindAgentByDesc, response_handler, findAgent_handler, useTerminal_handler, UseTerminal };