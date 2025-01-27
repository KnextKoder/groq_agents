import { z } from "zod";
import { ToolUseModels, MessageType, DependencyTypeSchema } from "./types";
import {tool, generateText, CoreTool} from 'ai'
import { createGroq } from "@ai-sdk/groq";
import { DefaultAgentBody, DefaultSystemPrompt } from "./utils";



export const ParamsSchema = z.record(z.any())
const ExecutionResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    message: z.string().optional()
});
const RetrievalResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    responseBody: z.any()
});
const CustomResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    other: z.any().optional()
})

export const ActionSchema = z.object({
    /**
     * Defines the name for a specific action
     */
    name: z.string(),

    /**
     * Types of action, where `Execution Types` return a predefined response with the status of their action 
     * and `Retrieval Types` return a response object with the status and the response body
     */
    type: z.enum(["Execution", "Retrieval", "Custom"]),

    /**
     * Defines the action
     */
    description: z.string(),

    /**
     * Parameters for the action, it accepts any key-value pairs where the keys are strings and the values can be of any type
     */
    params: ParamsSchema.default({}),

    /**
     * Function to execute the action, 
     * @returns `type of ExecutionResponseSchema` or `RetrievalResponseSchema`
     */
    function: z.function().args(ParamsSchema).returns(z.promise(z.union([ExecutionResponseSchema, RetrievalResponseSchema, CustomResponseSchema])))
});

export const AgentSchema = z.object({
    /**
     * Unique Agent ID
     */
    id: z.string(),

    /**
     * Name of the Agent
     */
    name: z.string(),
    
    /**
     * Simple description of the agent's capabilities and areas of use
     */
    description: z.string(),

    /**
     * A list of dependencies for packages that and agent requires to work
     */
    dependency: z.array(DependencyTypeSchema).optional(),
    
    /**
     * Array of actions (tools) that the agent can interface with
     */
    actions: z.array(ActionSchema)
});

export type Action = z.infer<typeof ActionSchema>;
export type AgentType = z.infer<typeof AgentSchema>;

export class Agent {
    private system: string;
    private agentBody: AgentType;
    public model: ToolUseModels
    private task: string;
    private api_key: string
    messages: MessageType[];

    constructor(system: string|undefined = DefaultSystemPrompt, agentBody: AgentType|undefined, model: ToolUseModels, task: string, api_key: string) {
        this.system = system || DefaultSystemPrompt;
        this.agentBody = agentBody || DefaultAgentBody;
        this.model = model;
        this.messages = [];
        this.task = task;
        this.api_key = api_key

        if (this.system) {
            this.messages.push({ role: "system", content: this.system });
        }
    }

    

    public async _call() {
        this.messages.push({ role: "user", content: `${this.task}` });
        const result = await this.execute();
        this.messages.push({ role: "assistant", content: result || "" });
        return result;
    }

    public async work() {
        this.messages.push({ role: "user", content: `${this.task}` });
        const result = await this.execute();
        this.messages.push({ role: "assistant", content: result || "" });
        return result;
    }

    private async execute() {
        const formattedMessages = this.messages.map(message => ({
            role: message.role,
            content: message.content,
        }));
    
        const data = {
            model: this.model,
            system: this.system,
            messages: formattedMessages,
            activeAgent: this.agentBody
        }
        console.log("Piping Data...", data)

        const groq = createGroq({apiKey: this.api_key});
    
        const completion = await generateText({
            model: groq(this.model),
            system: this.system,
            messages: formattedMessages,
            tools: this.agentBody.actions.reduce((acc, action) => {
                const paramsSchema = z.object(action.params);
                acc[action.name] = tool({
                    description: action.description,
                    parameters: paramsSchema,
                    execute: async (params) => {
                        return action.function(params);
                    },
                });
                return acc;
            }, {} as Record<string, CoreTool>),
            maxSteps: 10,
        });
    
        return completion.text;
    }

    public async useAgent(model: ToolUseModels) {
        const actionNames = this.agentBody.actions.map(action => action.name).join(", ");
        const tools: Record<string, CoreTool> = {};
        const groq = createGroq({apiKey: this.api_key});

        this.agentBody.actions.forEach(action => {
            const paramsSchema = z.object(action.params);
            tools[action.name] = tool({
                description: action.description,
                parameters: paramsSchema,
                execute: async (paramsSchema) => {
                    return action.function(paramsSchema);
                },
            });
        });

        const { toolCalls } = await generateText({
            model: groq(model),
            tools,
            system: `You are ${this.agentBody.name}. Your primary function is ${this.agentBody.description}. You can perform the following actions: ${actionNames}.`,
            prompt: "",
            maxSteps: 10,
        });

        console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
    }

    async useAgentWithAnswer(model: ToolUseModels) {
        const actionNames = this.agentBody.actions.map(action => action.name).join(", ");
        const tools: Record<string, CoreTool> = {};
        const groq = createGroq({apiKey: this.api_key});

        this.agentBody.actions.forEach(action => {
            const paramsSchema = z.object(action.params);
            tools[action.name] = tool({
                description: action.description,
                parameters: paramsSchema,
                execute: async (paramsSchema) => {
                    return action.function(paramsSchema);
                },
            });
        });

        tools["answer"] = tool({
            description: "A tool for providing the final answer",
            parameters: z.object({
                steps: z.array(z.object({
                    action_taken: z.string(),
                    reason_why: z.string(),
                })),
                answer: z.string(),
            }),
        });

        const { toolCalls } = await generateText({
            model: groq(model),
            tools,
            system: `You are ${this.agentBody.name}. Your primary function is ${this.agentBody.description}. You can perform the following actions: ${actionNames}.`,
            prompt: "",
            maxSteps: 10,
        });

        console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
    }
}


// Example usage
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
