"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscriminatedActionSchema = exports.AgentSchema = exports.Agent = exports.ParamsSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("./types");
const ai_1 = require("ai");
const groq_1 = require("@ai-sdk/groq");
const utils_1 = require("./utils");
const ws_1 = __importDefault(require("ws"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const http = __importStar(require("http"));
const json5_1 = __importDefault(require("json5"));
const Master = __importStar(require("../core/memory/code/agentDumps/Master_Agent_000000000000"));
const ParamsSchema = (schema) => ({
    parameters: schema,
});
exports.ParamsSchema = ParamsSchema;
const BaseParamsSchema = zod_1.z.record(zod_1.z.any());
const ExecutionResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(["200", "400", "500"]),
    message: zod_1.z.string(),
});
const RetrievalResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(["200", "400", "500"]),
    responseBody: zod_1.z.record(zod_1.z.any()),
});
const CustomResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(["200", "400", "500"]),
    other: zod_1.z.any(),
});
const ExecutionActionSchema = (params) => zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Execution"),
    description: zod_1.z.string(),
    params: params,
    handlerKey: zod_1.z.string(), // Reference to the function in your registry or file
});
const RetrievalActionSchema = (params) => zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Retrieval"),
    description: zod_1.z.string(),
    params: params,
    handlerKey: zod_1.z.string(),
});
const CustomActionSchema = (params) => zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Custom"),
    description: zod_1.z.string(),
    params: params,
    handlerKey: zod_1.z.string(),
});
const DiscriminatedActionSchema = zod_1.z.discriminatedUnion("type", [
    ExecutionActionSchema(BaseParamsSchema),
    RetrievalActionSchema(BaseParamsSchema),
    CustomActionSchema(BaseParamsSchema),
]);
exports.DiscriminatedActionSchema = DiscriminatedActionSchema;
const AgentSchema = zod_1.z.object({
    /**
     * Unique Agent ID
     */
    id: zod_1.z.string(),
    /**
     * Name of the Agent
     */
    name: zod_1.z.string(),
    /**
     * Simple description of the agent's capabilities and areas of use
     */
    description: zod_1.z.string(),
    /**
     * A list of dependencies for packages that an agent requires to work
     */
    dependency: zod_1.z.array(types_1.DependencyTypeSchema).optional(),
    /**
     * Array of actions (tools) that the agent can interface with
     */
    actions: zod_1.z.array(DiscriminatedActionSchema),
});
exports.AgentSchema = AgentSchema;
class Agent {
    constructor(system = Master.SystemPrompt, agentBody, model, task, api_key, timer) {
        this.server = null;
        this.wss = null;
        this.serverConfig = {
            port: 9090,
            host: 'localhost',
            enableWebsocket: true
        };
        this.useStreamLogging = true;
        this.system = system || Master.SystemPrompt;
        this.agentBody = agentBody || Master.AgentBody;
        this.model = model;
        this.messages = [];
        this.task = task;
        this.api_key = api_key;
        this.TIMEOUT_MS = timer || 1 * 60 * 1000;
        if (this.system) {
            this.messages.push({ role: "system", content: this.system });
        }
        (0, utils_1.Logger)("Info", `Agent ${this.agentBody.name} initialized with task: ${this.task}`, this.useStreamLogging);
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.Logger)("Action", `Starting work on task: ${this.task}`, this.useStreamLogging);
            this.messages.push({ role: "user", content: `${this.task}` });
            const result = yield this.execute();
            this.messages.push({ role: "assistant", content: result || "" });
            (0, utils_1.Logger)("Response", `Completed work on task: ${this.task}`, this.useStreamLogging);
            return result;
        });
    }
    watcher() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.Logger)("Info", `Starting watcher agent`, this.useStreamLogging);
            const groq = new groq_sdk_1.default({
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
            (0, utils_1.Logger)("[WA]", `Provided Context: ${JSON.stringify(context)}`, this.useStreamLogging);
            const prompt = `As an AI task assessor, evaluate if the following task has been completed successfully.
        Task: ${this.task}
        Context: ${JSON.stringify(context, null, 2)}
        Provide your assessment in JSON format, strictly adhering to the following schema: ${jsonSchema}.
        Ensure the response is ONLY the JSON object.`;
            try {
                const completion = yield groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: this.model,
                    temperature: 0,
                    stream: false,
                    response_format: { type: "json_object" }
                });
                const response = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                console.log("Watcher Raw response: ", response);
                (0, utils_1.Logger)("[WA]", `Watcher Raw Response: ${JSON.stringify(response)}`, this.useStreamLogging);
                if (!response) {
                    (0, utils_1.Logger)("[WA]", `No response from model`, this.useStreamLogging);
                    return {
                        iscomplete: false,
                        assesment: "No response from model"
                    };
                }
                let parsedResponse;
                try {
                    parsedResponse = json5_1.default.parse(response);
                }
                catch (parseError) {
                    (0, utils_1.Logger)("[WA]", `JSON5 Parse Error: ${parseError}. Raw response: ${response}`, this.useStreamLogging);
                    return {
                        iscomplete: false,
                        assesment: `JSON5 Parse Error: ${parseError}`
                    };
                }
                // Validate response structure
                if (typeof parsedResponse.iscomplete !== 'boolean' || typeof parsedResponse.assesment !== 'string') {
                    (0, utils_1.Logger)("[WA]", `Invalid response format`, this.useStreamLogging);
                    return {
                        iscomplete: false,
                        assesment: "Invalid response format from model"
                    };
                }
                (0, utils_1.Logger)("[WA]", `\n Task: ${this.task} assessment complete. \n Status: ${parsedResponse.iscomplete ? 'Complete' : 'Incomplete'} \n Assessment: ${parsedResponse.assesment}`, this.useStreamLogging);
                return {
                    iscomplete: parsedResponse.iscomplete,
                    assesment: parsedResponse.assesment
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Error parsing assessment response";
                (0, utils_1.Logger)("Error", `[WA] Error: ${errorMessage}.`, this.useStreamLogging); // Log the raw response
                return {
                    iscomplete: false,
                    assesment: errorMessage
                };
            }
        });
    }
    getLogicFilePath(agent) {
        const sanitizedAgentName = agent.name.replace(/\s+/g, "_");
        const sanitizedID = agent.id.replace(/\s+/g, "").trim();
        return `../core/memory/code/functionDumps/${sanitizedAgentName}_${sanitizedID}.ts`;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const startTime = Date.now();
                let isTaskComplete = false;
                while (!isTaskComplete && Date.now() - startTime < this.TIMEOUT_MS) {
                    (0, utils_1.Logger)("Action", `Execution attempt at ${new Date().toISOString()}`, this.useStreamLogging);
                    const formattedMessages = this.messages.map(message => ({
                        role: message.role,
                        content: message.content,
                    }));
                    yield this.startServer();
                    const groq = (0, groq_1.createGroq)({ apiKey: this.api_key });
                    (0, utils_1.Logger)("Info", `Generating Output`, this.useStreamLogging);
                    console.log("Model: ", this.model);
                    console.log("Sys Msg: ", this.system);
                    console.log("Messages: ", formattedMessages);
                    const logicFilePath = this.getLogicFilePath(this.agentBody);
                    const agentLogic = yield (_a = logicFilePath, Promise.resolve().then(() => __importStar(require(_a))));
                    // Build the tools map by using handlerKey to look up logic functions from agentLogic
                    const toolsMap = this.agentBody.actions.reduce((acc, action) => {
                        const paramsSchema = action.params instanceof zod_1.z.ZodType
                            ? action.params
                            : zod_1.z.object(action.params || {});
                        acc[action.name] = (0, ai_1.tool)({
                            description: action.description,
                            parameters: paramsSchema,
                            execute: (params) => __awaiter(this, void 0, void 0, function* () {
                                const handler = agentLogic[action.handlerKey];
                                if (typeof handler !== "function") {
                                    throw new Error(`Handler for key ${action.handlerKey} not found in ${logicFilePath}`);
                                }
                                const result = yield handler(params);
                                this.messages.push({
                                    role: "system",
                                    content: `Tool ${action.name}, result: ${JSON.stringify(result)}`
                                });
                                return result;
                            }),
                        });
                        return acc;
                    }, {});
                    const completion = yield (0, ai_1.generateText)({
                        model: groq(this.model),
                        system: this.system,
                        messages: formattedMessages,
                        tools: toolsMap,
                        maxSteps: 10,
                    });
                    this.messages.push({ role: "assistant", content: completion.text });
                    (0, utils_1.Logger)("Info", `completion messages: ${JSON.stringify(this.messages)}`, this.useStreamLogging);
                    const { iscomplete, assesment } = yield this.watcher();
                    if (iscomplete) {
                        yield this.stopServer();
                        (0, utils_1.Logger)("Response", `Task completed successfully: ${completion.text}`, this.useStreamLogging);
                        return completion.text;
                    }
                    this.messages.push({
                        role: "system",
                        content: `Previous attempt assessment: ${assesment}. Please try again with remaining time: ${Math.round((this.TIMEOUT_MS - (Date.now() - startTime)) / 1000)} seconds.`
                    });
                }
                (0, utils_1.Logger)("Error", `Task timed out after ${this.TIMEOUT_MS}ms`, this.useStreamLogging);
                throw new Error('Task incomplete after timeout');
            }
            catch (error) {
                yield this.stopServer();
                let errorMessage = 'Unknown error occurred';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                else if (typeof error === 'string') {
                    errorMessage = error;
                }
                else if (error && typeof error === 'object' && 'message' in error) {
                    errorMessage = String(error.message);
                }
                (0, utils_1.Logger)("Error", `Task execution failed: ${errorMessage}`, this.useStreamLogging);
                return `Task execution failed: ${errorMessage}`;
            }
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.server)
                    return;
                (0, utils_1.Logger)("Info", `Starting server on ${this.serverConfig.host}:${this.serverConfig.port}`, this.useStreamLogging);
                this.server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
                    // Add CORS headers
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    // Basic request logging
                    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
                    try {
                        switch (req.url) {
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
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error
                            ? error.message
                            : 'Internal server error';
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: errorMessage }));
                    }
                }));
                // Setup WebSocket for real-time updates
                if (this.serverConfig.enableWebsocket) {
                    try {
                        this.wss = new ws_1.default.Server({ server: this.server });
                        this.wss.on('error', (error) => {
                            (0, utils_1.Logger)("Error", `WebSocket error: ${error.message}`, this.useStreamLogging);
                        });
                        this.wss.on('connection', (ws) => {
                            ws.send(JSON.stringify({ type: 'connected', message: 'Connected to agent server' }));
                            // Create a message handler function
                            const handleMessage = (message) => {
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
                    }
                    catch (wsError) { // Explicitly type the error
                        const errorMessage = wsError instanceof Error
                            ? wsError.message
                            : 'Unknown WebSocket setup error';
                        (0, utils_1.Logger)("Error", `WebSocket setup failed: ${errorMessage}`, this.useStreamLogging);
                    }
                }
                return new Promise((resolve, reject) => {
                    this.server.listen(this.serverConfig.port, this.serverConfig.host, () => {
                        (0, utils_1.Logger)("Info", `Server running at http://${this.serverConfig.host}:${this.serverConfig.port}`, this.useStreamLogging);
                        resolve();
                    });
                    this.server.on('error', (err) => {
                        (0, utils_1.Logger)("Error", `Server error: ${err.message}`, this.useStreamLogging);
                        reject(err);
                    });
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Unknown server error';
                (0, utils_1.Logger)("Error", `Failed to start server: ${errorMessage}`, this.useStreamLogging);
                throw error;
            }
        });
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.Logger)("Info", `Stopping server`, this.useStreamLogging);
            if (this.wss) {
                this.wss.close();
                this.wss = null;
            }
            if (!this.server) {
                return;
            }
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('Server stopped');
                    this.server = null;
                    resolve();
                });
            });
        });
    }
    getTaskCompletionRate() {
        const completedTasks = this.messages.filter(m => m.role === "assistant" && !m.content.includes("Task execution failed")).length;
        return completedTasks / Math.max(1, this.messages.length);
    }
    getAverageResponseTime() {
        const timestamps = [];
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
exports.Agent = Agent;
