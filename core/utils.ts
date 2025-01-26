import { AgentType } from "./agents";
import { tool, generateText, CoreTool } from 'ai';
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { CommandResult, DependencyTypeSchema, ToolUseModels } from "./types";
import { DependencyType } from "../core/types";
import { exec } from "child_process";

const DefaultSystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary function is to orchestrate other agents to achieve predefined tasks efficiently. You have access to the following actions: useTerminal.
`;

const DefaultAgentBody: AgentType = {
    id: "00000000000000000000",
    name: "Orchestrator Agent",
    description: "Agent for orchestrating other agents in the aim to achieve a predefined task",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on the terminal. Restricted to installation on NPM packages",
            type: "Execution",
            params: z.array(DependencyTypeSchema),
            function: async (params: Record<string, any>) => {
                const dependencies: DependencyType[] = params as DependencyType[];
                const command = `npm install ${dependencies.map(dep => `${dep.package}@${dep.version}`).join(" ")}`;
                const result = await executeCommand(command);
                return {
                    status: result.stderr ? "500" : "200",
                    message: result.stderr || result.stdout
                };
            }
        }
    ]
};

async function executeCommand(command: string): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
        const allowedCommands = [`bun install`, `npm install`];

        if (!allowedCommands.some(allowedCommand => command.startsWith(allowedCommand))) {
            return reject(new Error("Command not allowed. Only `bun install` or `npm install` are permitted."));
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ stdout: "", stderr: error.message });
                return;
            }

            resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        });
    });
}

async function FindAgent(id: string): Promise<AgentType> {
    // Dummy Implementation
    const agent: AgentType = {
        id: "1234567890",
        name: "X-Agent",
        description: "Agent for Interfacing with the X social media platform",
        actions: [
            {
                name: "create_post",
                type: "Execution",
                description: "Creates a post on the X social media platform",
                params: {
                    param1: "example",
                    param2: 42,
                    param3: true
                },
                function: async (params) => {
                    // Simulate an API call to create a post
                    const response = await fetch('https://api.example.com/create_post', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(params)
                    });
                    const data = await response.json();
                    return { status: response.status.toString() as "200" | "400" | "500", message: data.message };
                }
            },
            {
                name: "fetch_data",
                type: "Retrieval",
                description: "Fetches data from the X social media platform",
                params: {
                    param1: "example"
                },
                function: async (params) => {
                    // Simulate an API call to fetch data
                    const response = await fetch(`https://api.example.com/fetch_data?param1=${params.param1}`);
                    const data = await response.json();
                    return { status: response.status.toString() as "200" | "400" | "500", responseBody: data };
                }
            }
        ]
    };

    return agent;
}

async function AgentCall(agent: AgentType, model: ToolUseModels) {
    const actionNames = agent.actions.map(action => action.name).join(", ");
    const tools: Record<string, CoreTool> = {};

    agent.actions.forEach(action => {
        const paramsSchema = z.object(action.params ?? {});
        tools[action.name] = tool({
            description: action.description,
            parameters: paramsSchema,
            execute: async (paramsSchema) => { return action.function(paramsSchema); },
        });
    });

    const { toolCalls } = await generateText({
        model: groq(model),
        tools,
        system: `You are ${agent.name}. Your primary function is ${agent.description}. You can perform the following actions: ${actionNames}.`,
        prompt: "",
        maxSteps: 10
    });
}

async function AgentCallWithAnswer(agent: AgentType, model: ToolUseModels) {
    const actionNames = agent.actions.map(action => action.name).join(", ");
    const tools: Record<string, CoreTool> = {};

    agent.actions.forEach(action => {
        const paramsSchema = z.object(action.params ?? {});
        tools[action.name] = tool({
            description: action.description,
            parameters: paramsSchema,
            execute: async (paramsSchema) => { return action.function(paramsSchema); },
        });
    });

    tools["answer"] = tool({
        description: "A tool for providing the final answer",
        parameters: z.object({
            steps: z.array(z.object({
                action_taken: z.string(),
                reason_why: z.string()
            })),
            answer: z.string()
        })
    });

    const { toolCalls } = await generateText({
        model: groq(model),
        tools,
        system: `You are ${agent.name}. Your primary function is ${agent.description}. You can perform the following actions: ${actionNames}.`,
        prompt: "",
        maxSteps: 10
    });

    console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
}

export { FindAgent, AgentCall, AgentCallWithAnswer, DefaultAgentBody, DefaultSystemPrompt };