import { AgentType } from "./agents";
import { tool, generateText, CoreTool } from 'ai';
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { CommandResult, DependencyTypeSchema, ParamsType, ToolUseModels } from "./types";
import { FindAgentByDes, UseTerminal } from "./tools/tools";


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

const DefaultSystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`;

const DefaultAgentBody: AgentType = {
    id: "00000000000000000000",
    name: "Master Agent",
    description: "Agent for orchestrating other agents with the aim of achieving a predefined task, You have access to the following actions: useTerminal. findAgent",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on a terminal. **Currently restricted to installing npm packages",
            type: "Execution",
            params: z.array(DependencyTypeSchema),
            function:  (params: ParamsType) => UseTerminal(params)
        },
        {
            name: "findAgent",
            description: "Search for an agent to orchestrate with based off a description of the agent",
            type: "Retrieval",
            params: z.object({ description: z.string() }),
            function: async function (params: ParamsType): Promise<{ status: "200" | "400" | "500"; responseBody: { agent: AgentType; } }> {
                const response: AgentType = await FindAgentByDes(params.description);
                return {
                    status: "200",
                    responseBody: { agent: response as AgentType }
                };
            }
        }
    ]
};



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


export { FindAgent, AgentCall, AgentCallWithAnswer, DefaultAgentBody, DefaultSystemPrompt };