import Groq from "groq-sdk";
import { z } from "zod";
import { GroqAgentType, RoleType, MessageType } from "./types";



export const ParamsSchema = z.record(z.any());
const ExecutionResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    message: z.string().optional()
});
const RetrievalResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    responseBody: z.any().optional()
});


export const ActionSchema = z.object({
    /**
     * Defines the name for a specific action
     */
    actionName: z.string(),

    /**
     * Types of action, where `Execution Types` return a predefined response with the status of their action 
     * and `Retrieval Types` return a response object with the status and the response body
     */
    type: z.enum(["Execution", "Retrieval"]),

    /**
     * Defines the action
     */
    description: z.string(),

    /**
     * Parameters for the action, it accepts any key-value pairs where the keys are strings and the values can be of any type
     */
    params: ParamsSchema.optional(),

    /**
     * Function to execute the action, 
     * @returns `type of ExecutionResponseSchema` or `RetrievalResponseSchema`
     */
    function: z.function().args(ParamsSchema).returns(z.promise(z.union([ExecutionResponseSchema, RetrievalResponseSchema])))
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
    agentDescription: z.string(),
    
    /**
     * Array of actions (tools) that the agent can interface with
     */
    actions: z.array(ActionSchema)
});

export type Action = z.infer<typeof ActionSchema>;
export type AgentType = z.infer<typeof AgentSchema>;

export class Agent {

    public system: string
    private client: Groq
    private agentBody: AgentType;
    public model: GroqAgentType["model"]

    constructor(client: any, system: string = "", agentBody: AgentType, model: GroqAgentType["model"]) {
        this.client = client;
        this.system = system;
        this.agentBody = agentBody;
        this.model = model;
        this.messages = [];
        if (this.system) {
            this.messages.push({ role: "system", content: this.system });
        }
    }

    messages: MessageType[]

    async __call__(message: string) {
        if (message) {
            this.messages.push({ role: "user", content: message });
        }
        const result = await this.execute();
        this.messages.push({ role: "assistant", content: result||"" });
        return result;
    }

    async execute() {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: this.messages
        });
        return completion.choices[0].message.content;
    }
}

// Example function that takes an Action as a parameter and executes it with provided params
async function executeAction(action: Action, params: z.infer<typeof ParamsSchema>) {
    console.log(`Executing action: ${action.actionName}`);
    const result = await action.function(params);
    console.log("Result:", result);
}

// Example usage
const agent: AgentType = {
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

// Validate the agent object
const validationResult = AgentSchema.safeParse(agent);
if (!validationResult.success) {
    console.error(validationResult.error);
} else {
    console.log("Agent is valid:", validationResult.data);
    // Execute an action from the agent with provided params
    const action = agent.actions[0];
    const params = { param1: "new example", param2: 100, param3: false };
    executeAction(action, params);
}