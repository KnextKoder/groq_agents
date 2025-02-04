"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.AgentSchema = exports.DiscriminatedActionSchema = exports.ParamsSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("./types");
const ai_1 = require("ai");
const groq_1 = require("@ai-sdk/groq");
const utils_1 = require("./utils");
// --- Parameter Schema (unchanged) ---
exports.ParamsSchema = zod_1.z.record(zod_1.z.any());
// --- Response Schemas ---
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
const ExecutionActionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Execution"),
    description: zod_1.z.string(),
    params: exports.ParamsSchema.default({}),
    function: zod_1.z.function()
        .args(exports.ParamsSchema)
        .returns(zod_1.z.promise(ExecutionResponseSchema)),
});
const RetrievalActionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Retrieval"),
    description: zod_1.z.string(),
    params: exports.ParamsSchema.default({}),
    function: zod_1.z.function()
        .args(exports.ParamsSchema)
        .returns(zod_1.z.promise(RetrievalResponseSchema)),
});
const CustomActionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal("Custom"),
    description: zod_1.z.string(),
    params: exports.ParamsSchema.default({}),
    function: zod_1.z.function()
        .args(exports.ParamsSchema)
        .returns(zod_1.z.promise(CustomResponseSchema)),
});
// Combine them with a discriminated union
exports.DiscriminatedActionSchema = zod_1.z.discriminatedUnion("type", [
    ExecutionActionSchema,
    RetrievalActionSchema,
    CustomActionSchema,
]);
// --- Agent Schema ---
exports.AgentSchema = zod_1.z.object({
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
    actions: zod_1.z.array(exports.DiscriminatedActionSchema),
});
class Agent {
    constructor(system = utils_1.DefaultSystemPrompt, agentBody, model, task, api_key) {
        this.system = system || utils_1.DefaultSystemPrompt;
        this.agentBody = agentBody || utils_1.DefaultAgentBody;
        this.model = model;
        this.messages = [];
        this.task = task;
        this.api_key = api_key;
        if (this.system) {
            this.messages.push({ role: "system", content: this.system });
        }
    }
    _call() {
        return __awaiter(this, void 0, void 0, function* () {
            this.messages.push({ role: "user", content: `${this.task}` });
            const result = yield this.execute();
            this.messages.push({ role: "assistant", content: result || "" });
            return result;
        });
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            this.messages.push({ role: "user", content: `${this.task}` });
            const result = yield this.execute();
            this.messages.push({ role: "assistant", content: result || "" });
            return result;
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedMessages = this.messages.map(message => ({
                role: message.role,
                content: message.content,
            }));
            const data = {
                model: this.model,
                system: this.system,
                messages: formattedMessages,
                activeAgent: this.agentBody
            };
            console.log("Piping Data...", data);
            const groq = (0, groq_1.createGroq)({ apiKey: this.api_key });
            const completion = yield (0, ai_1.generateText)({
                model: groq(this.model),
                system: this.system,
                messages: formattedMessages,
                tools: this.agentBody.actions.reduce((acc, action) => {
                    const paramsSchema = zod_1.z.object(action.params);
                    acc[action.name] = (0, ai_1.tool)({
                        description: action.description,
                        parameters: paramsSchema,
                        execute: (params) => __awaiter(this, void 0, void 0, function* () {
                            return action.function(params);
                        }),
                    });
                    return acc;
                }, {}),
                maxSteps: 10,
            });
            return completion.text;
        });
    }
    useAgent(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionNames = this.agentBody.actions.map(action => action.name).join(", ");
            const tools = {};
            const groq = (0, groq_1.createGroq)({ apiKey: this.api_key });
            this.agentBody.actions.forEach(action => {
                const paramsSchema = zod_1.z.object(action.params);
                tools[action.name] = (0, ai_1.tool)({
                    description: action.description,
                    parameters: paramsSchema,
                    execute: (paramsSchema) => __awaiter(this, void 0, void 0, function* () {
                        return action.function(paramsSchema);
                    }),
                });
            });
            const { toolCalls } = yield (0, ai_1.generateText)({
                model: groq(model),
                tools,
                system: `You are ${this.agentBody.name}. Your primary function is ${this.agentBody.description}. You can perform the following actions: ${actionNames}.`,
                prompt: "",
                maxSteps: 10,
            });
            console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
        });
    }
    useAgentWithAnswer(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionNames = this.agentBody.actions.map(action => action.name).join(", ");
            const tools = {};
            const groq = (0, groq_1.createGroq)({ apiKey: this.api_key });
            this.agentBody.actions.forEach(action => {
                const paramsSchema = zod_1.z.object(action.params);
                tools[action.name] = (0, ai_1.tool)({
                    description: action.description,
                    parameters: paramsSchema,
                    execute: (paramsSchema) => __awaiter(this, void 0, void 0, function* () {
                        return action.function(paramsSchema);
                    }),
                });
            });
            tools["answer"] = (0, ai_1.tool)({
                description: "A tool for providing the final answer",
                parameters: zod_1.z.object({
                    steps: zod_1.z.array(zod_1.z.object({
                        action_taken: zod_1.z.string(),
                        reason_why: zod_1.z.string(),
                    })),
                    answer: zod_1.z.string(),
                }),
            });
            const { toolCalls } = yield (0, ai_1.generateText)({
                model: groq(model),
                tools,
                system: `You are ${this.agentBody.name}. Your primary function is ${this.agentBody.description}. You can perform the following actions: ${actionNames}.`,
                prompt: "",
                maxSteps: 10,
            });
            console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
        });
    }
}
exports.Agent = Agent;
