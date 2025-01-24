import { Agent } from "./agents";
import {tool, generateText, CoreTool} from 'ai'
import {groq} from "@ai-sdk/groq"
import { z } from "zod";

export async function FindAgent(id:string):Promise<Agent> {
    
    // const response = await fetch(`https://...api.com/find_agent?id=${id}`)
    // const data:Agent = await response.json()

    // Dummy Implementation
    const agent: Agent = {
        id: "1234567890",
        name: "X-Agent",
        agentDescription: "Agent for Interfacing with the X social media platform",
        actions: [
            {
                actionName: "create_post",
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
                actionName: "fetch_data",
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

    return agent
}


export async function AgentCall(agent: Agent, model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192") {
    const actionNames = agent.actions.map(action => action.actionName).join(", ");
    const tools: Record<string, CoreTool> = {};

    agent.actions.forEach(action => {
        const paramsSchema = z.object(action.params ?? {});
        tools[action.actionName] = tool({
            description: action.description,
            parameters: paramsSchema,
            execute: async (paramsSchema) => {return action.function(paramsSchema)},
        });
    });

    const { toolCalls } = await generateText({
        model: groq(model),
        tools,
        system: `You are ${agent.name}. Your primary function is ${agent.agentDescription}. You can perform the following actions: ${actionNames}.`,
        prompt: "",
        maxSteps: 10
    });
}


export async function AgentCallWithAnswer(agent: Agent, model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192") {
    const actionNames = agent.actions.map(action => action.actionName).join(", ");
    const tools: Record<string, CoreTool> = {};

    agent.actions.forEach(action => {
        const paramsSchema = z.object(action.params ?? {});
        tools[action.actionName] = tool({
            description: action.description,
            parameters: paramsSchema,
            execute: async (paramsSchema) => {return action.function(paramsSchema)},
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
    })

    const { toolCalls } = await generateText({
        model: groq(model),
        tools,
        system: `You are ${agent.name}. Your primary function is ${agent.agentDescription}. You can perform the following actions: ${actionNames}.`,
        prompt: "",
        maxSteps: 10
    });
}