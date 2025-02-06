import { z } from "zod";
import { ToolUseModels, MessageType, DependencyTypeSchema } from "./types";
import { tool, generateText, CoreTool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { DefaultAgentBody, DefaultSystemPrompt, Logger } from "./utils";
import WebSocket from 'ws';
import Groq from 'groq-sdk';
import * as http from "http"
import JSON5 from 'json5';


type ParamsSchemaType<P extends z.ZodTypeAny = z.ZodTypeAny> = {
    description?: string;
    parameters: P;
};
  
const ParamsSchema = <P extends z.ZodTypeAny>(schema: P): ParamsSchemaType<P> => ({
    parameters: schema,
});
  
const BaseParamsSchema = z.record(z.any());
  
const ExecutionResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    message: z.string(),
});
  
const RetrievalResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    responseBody: z.record(z.any()),
});
  
const CustomResponseSchema = z.object({
    status: z.enum(["200", "400", "500"]),
    other: z.any(),
});

const ExecutionActionSchema = <P extends z.ZodTypeAny>(params: P) => z.object({
    name: z.string(),
    type: z.literal("Execution"),
    description: z.string(),
    params: params,
    handlerKey: z.string(), // Reference to the function in your registry or file
  });
  
  const RetrievalActionSchema = <P extends z.ZodTypeAny>(params: P) => z.object({
    name: z.string(),
    type: z.literal("Retrieval"),
    description: z.string(),
    params: params,
    handlerKey: z.string(),
  });
  
  const CustomActionSchema = <P extends z.ZodTypeAny>(params: P) => z.object({
    name: z.string(),
    type: z.literal("Custom"),
    description: z.string(),
    params: params,
    handlerKey: z.string(),
  });

  const DiscriminatedActionSchema = z.discriminatedUnion("type", [
    ExecutionActionSchema(BaseParamsSchema),
    RetrievalActionSchema(BaseParamsSchema),
    CustomActionSchema(BaseParamsSchema),
  ]);

const AgentSchema = z.object({
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
   * A list of dependencies for packages that an agent requires to work
   */
  dependency: z.array(DependencyTypeSchema).optional(),
  /**
   * Array of actions (tools) that the agent can interface with
   */
  actions: z.array(DiscriminatedActionSchema),

});

interface ServerConfig {
    port: number;
    host: string;
    enableWebsocket: boolean;
}


class Agent {
    private system: string;
    private agentBody: AgentType;
    public model: ToolUseModels
    private task: string;
    private api_key: string
    private server: http.Server | null = null;
    private wss: WebSocket.Server | null = null;
    private readonly serverConfig: ServerConfig = {
        port: 9090,
        host: 'localhost',
        enableWebsocket: true
    };
    private readonly TIMEOUT_MS:number
    private readonly useStreamLogging = true;

    messages: MessageType[];
    
    constructor(system: string|undefined = DefaultSystemPrompt, agentBody: AgentType|undefined, model: ToolUseModels, task: string, api_key: string, timer:number|undefined) {
        this.system = system || DefaultSystemPrompt;
        this.agentBody = agentBody || DefaultAgentBody;
        this.model = model;
        this.messages = [];
        this.task = task;
        this.api_key = api_key
        this.TIMEOUT_MS = timer || 1 * 60 * 1000
        
        if (this.system) {
            this.messages.push({ role: "system", content: this.system });
        }
        Logger(`Agent ${this.agentBody.name} initialized with task: ${this.task}`, this.useStreamLogging);
    }

    public async work() {
        Logger(`Starting work on task: ${this.task}`, this.useStreamLogging);
        this.messages.push({ role: "user", content: `${this.task}` });
        const result = await this.execute();
        this.messages.push({ role: "assistant", content: result || "" });
        Logger(`Completed work on task: ${this.task}`, this.useStreamLogging);
        return result;
    }

    private async watcher(): Promise<{
        iscomplete: boolean,
        assesment: string
    }> {
        Logger(`Starting watcher agent`, this.useStreamLogging)
        const groq = new Groq({
            apiKey: this.api_key,
        });
    
        const schema = {
            type: "object",
            properties: {
                iscomplete: {
                    type: "boolean",
                    description: "True if the task is complete, false otherwise"
                },
                assesment: {
                    type: "string",
                    description: "A detailed explanation of the assessment"
                }
            },
            required: ["iscomplete", "assesment"],
            description: "Assessment of task completion"
        };

        const jsonSchema = JSON.stringify(schema, null, 2);

        const context = {
            messages: this.messages,
            agent: this.agentBody,
            task: this.task
        };

        Logger(`[WA] Provided Context: ${JSON.stringify(context)}`, this.useStreamLogging)
    
        const prompt = `As an AI task assessor, evaluate if the following task has been completed successfully.
        Task: ${this.task}
        Context: ${JSON.stringify(context, null, 2)}
        Provide your assessment in JSON format, strictly adhering to the following schema: ${jsonSchema}.
        Ensure the response is ONLY the JSON object.`;
    
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: this.model,
                temperature: 0,
                stream: false,
                response_format: { type: "json_object" }
            });
    
            const response = completion.choices[0]?.message?.content;
            console.log("Watcher Raw response: ", response);
            Logger(`[WA] Watcher Raw Response: ${JSON.stringify(response)}`, this.useStreamLogging);
    
            if (!response) {
                Logger(`[WA] No response from model`, this.useStreamLogging);
                return {
                    iscomplete: false,
                    assesment: "No response from model"
                };
            }
    
            let parsedResponse;
            try {
                parsedResponse = JSON5.parse(response);
            } catch (parseError) {
                Logger(`[WA] JSON5 Parse Error: ${parseError}. Raw response: ${response}`, this.useStreamLogging);
                return {
                    iscomplete: false,
                    assesment: `JSON5 Parse Error: ${parseError}`
                };
            }
    
            // Validate response structure
            if (typeof parsedResponse.iscomplete !== 'boolean' || typeof parsedResponse.assesment !== 'string') {
                Logger(`[WA] Invalid response format`, this.useStreamLogging);
                return {
                    iscomplete: false,
                    assesment: "Invalid response format from model"
                };
            }
    
            Logger(`[WA] \n Task: ${this.task} assessment complete. \n Status: ${parsedResponse.iscomplete ? 'Complete' : 'Incomplete'} \n Assessment: ${parsedResponse.assesment}`, this.useStreamLogging);
    
            return {
                iscomplete: parsedResponse.iscomplete,
                assesment: parsedResponse.assesment
            };
    
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error parsing assessment response";
            Logger(`[WA] Error: ${errorMessage}.`, this.useStreamLogging); // Log the raw response
            return {
                iscomplete: false,
                assesment: errorMessage
            };
        }
    }
    private getLogicFilePath(agent: AgentType): string {
        const sanitizedAgentName = agent.name.replace(/\s+/g, "_");
        const sanitizedID = agent.id.replace(/\s+/g, "").trim();
        return `../core/memory/code/functionDumps/${sanitizedAgentName}_${sanitizedID}.ts`;
    }

    private async execute() {
        try {
            const startTime = Date.now();
            let isTaskComplete = false;
    
            while (!isTaskComplete && Date.now() - startTime < this.TIMEOUT_MS) {
                Logger(`Execution attempt at ${new Date().toISOString()}`, this.useStreamLogging);
                const formattedMessages = this.messages.map(message => ({
                    role: message.role,
                    content: message.content,
                }));
    
    
                await this.startServer();
                const groq = createGroq({ apiKey: this.api_key });
                
                Logger(`Generating Output`, this.useStreamLogging);
                console.log("Model: ", this.model);
                console.log("Sys Msg: ", this.system);
                console.log("Messages: ", formattedMessages);

                const logicFilePath = this.getLogicFilePath(this.agentBody);
                const agentLogic = await import(logicFilePath);
    
                // Build the tools map by using handlerKey to look up logic functions from agentLogic
                const toolsMap = this.agentBody.actions.reduce((acc, action) => {
                    const paramsSchema = action.params instanceof z.ZodType
                        ? action.params
                        : z.object(action.params || {});
    
                    acc[action.name] = tool({
                        description: action.description,
                        parameters: paramsSchema,
                        execute: async (params) => {
                            const handler = agentLogic[action.handlerKey];
                            if (typeof handler !== "function") {
                                throw new Error(`Handler for key ${action.handlerKey} not found in ${logicFilePath}`);
                            }
                            const result = await handler(params);
                            this.messages.push({
                                role: "system",
                                content: `Tool ${action.name}, result: ${JSON.stringify(result)}`
                            });
                            return result;
                        },
                    });
                    return acc;
                }, {} as Record<string, CoreTool>);
    
                const completion = await generateText({
                    model: groq(this.model),
                    system: this.system,
                    messages: formattedMessages,
                    tools: toolsMap,
                    maxSteps: 10,
                });
    
                this.messages.push({ role: "assistant", content: completion.text });
                Logger(`completion messages: ${JSON.stringify(this.messages)}`, this.useStreamLogging);
    
                const { iscomplete, assesment } = await this.watcher();
    
                if (iscomplete) {
                    await this.stopServer();
                    Logger(`Task completed successfully: ${completion.text}`, this.useStreamLogging);
                    return completion.text;
                }
    
                this.messages.push({ 
                    role: "system", 
                    content: `Previous attempt assessment: ${assesment}. Please try again with remaining time: ${
                        Math.round((this.TIMEOUT_MS - (Date.now() - startTime)) / 1000)
                    } seconds.`
                });
            }
    
            Logger(`Task timed out after ${this.TIMEOUT_MS}ms`, this.useStreamLogging);
            throw new Error('Task incomplete after timeout');
        } catch (error: unknown) {
            await this.stopServer();
            let errorMessage = 'Unknown error occurred';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
            }
            
            Logger(`Task execution failed: ${errorMessage}`, this.useStreamLogging);
            return `Task execution failed: ${errorMessage}`;
        }
    }
    

    private async startServer(): Promise<void> {
        try{
            if (this.server) return;

            Logger(`Starting server on ${this.serverConfig.host}:${this.serverConfig.port}`, this.useStreamLogging);
            this.server = http.createServer(async (req, res) => {
                // Add CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                
                // Basic request logging
                console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

                try {
                    switch(req.url) {
                        case '/health':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ status: 'healthy' }));
                            break;

                        case '/status':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({
                                agent: this.agentBody.name,
                                task: this.task,
                                model: this.model,
                                status: 'running',
                                uptime: process.uptime(),
                                messages: this.messages.length
                            }));
                            break;

                        case '/messages':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(this.messages));
                            break;

                        case '/metrics':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({
                                messageCount: this.messages.length,
                                taskCompletionRate: this.getTaskCompletionRate(),
                                averageResponseTime: this.getAverageResponseTime(),
                                memory: process.memoryUsage()
                            }));
                            break;

                        case '/tools':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(this.agentBody.actions));
                            break;

                        case '/docs':
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({
                                endpoints: [
                                    { path: '/health', method: 'GET', description: 'Health check endpoint' },
                                    { path: '/status', method: 'GET', description: 'Current agent status' },
                                    { path: '/messages', method: 'GET', description: 'Message history' },
                                    { path: '/metrics', method: 'GET', description: 'Performance metrics' },
                                    { path: '/tools', method: 'GET', description: 'Available tools' },
                                    { path: '/docs', method: 'GET', description: 'API documentation' }
                                ]
                            }));
                            break;

                        default:
                            res.writeHead(404);
                            res.end();
                    }
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error 
                        ? error.message 
                        : 'Internal server error';
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: errorMessage }));
                }
            });

            // Setup WebSocket for real-time updates
            if (this.serverConfig.enableWebsocket) {
                try {
                    this.wss = new WebSocket.Server({ server: this.server });

                    this.wss.on('error', (error) => {
                        Logger(`WebSocket error: ${error.message}`, this.useStreamLogging);
                    });
                    
                    this.wss.on('connection', (ws) => {
                        ws.send(JSON.stringify({ type: 'connected', message: 'Connected to agent server' }));
                        
                        // Create a message handler function
                        const handleMessage = (message: any) => {
                            ws.send(JSON.stringify({ type: 'message', data: message }));
                        };
                        
                        // Store the message handler for cleanup
                        const messageHandlers = new Set();
                        messageHandlers.add(handleMessage);
                        
                        // Clean up on client disconnect
                        ws.on('close', () => {
                            messageHandlers.delete(handleMessage);
                        });
                    });

                } catch (wsError: unknown) { // Explicitly type the error
                    const errorMessage = wsError instanceof Error 
                        ? wsError.message 
                        : 'Unknown WebSocket setup error';
                    Logger(`WebSocket setup failed: ${errorMessage}`, this.useStreamLogging);
                }
            }

            return new Promise((resolve, reject) => {
                this.server!.listen(this.serverConfig.port, this.serverConfig.host, () => {
                    Logger(`Server running at http://${this.serverConfig.host}:${this.serverConfig.port}`, this.useStreamLogging);
                    resolve();
                });

                this.server!.on('error', (err) => {
                    Logger(`Server error: ${err.message}`, this.useStreamLogging);
                    reject(err);
                });
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Unknown server error';
            Logger(`Failed to start server: ${errorMessage}`, this.useStreamLogging);
            throw error;
        }
    }
    
    public async stopServer(): Promise<void> {
        Logger(`Stopping server`, this.useStreamLogging);
        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }

        if (!this.server) {
            return;
        }

        return new Promise((resolve) => {
            this.server!.close(() => {
                console.log('Server stopped');
                this.server = null;
                resolve();
            });
        });
    }

    public getTaskCompletionRate(): number {
        const completedTasks = this.messages.filter(m => 
            m.role === "assistant" && !m.content.includes("Task execution failed")
        ).length;
        return completedTasks / Math.max(1, this.messages.length);
    }

    public getAverageResponseTime(): number {
        const timestamps: number[] = [];
        let prevTimestamp = Date.now();
        
        this.messages.forEach(message => {
            if (message.role === "assistant") {
                const currentTimestamp = Date.now();
                timestamps.push(currentTimestamp - prevTimestamp);
                prevTimestamp = currentTimestamp;
            }
        });
    
        return timestamps.length ? 
            timestamps.reduce((acc, time) => acc + time, 0) / timestamps.length : 
            0;
    }
    
}

type AgentType = z.infer<typeof AgentSchema>;
type Action = z.infer<typeof DiscriminatedActionSchema>;
export {ParamsSchema, Agent, AgentType, Action, AgentSchema, DiscriminatedActionSchema}