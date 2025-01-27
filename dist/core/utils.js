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
exports.DefaultSystemPrompt = exports.DefaultAgentBody = exports.AgentCallWithAnswer = exports.AgentCall = exports.FindAgent = void 0;
const ai_1 = require("ai");
const groq_1 = require("@ai-sdk/groq");
const zod_1 = require("zod");
const types_1 = require("./types");
const tools_1 = require("./tools/tools");
function AgentCall(agent, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const actionNames = agent.actions.map(action => action.name).join(", ");
        const tools = {};
        agent.actions.forEach(action => {
            var _a;
            const paramsSchema = zod_1.z.object((_a = action.params) !== null && _a !== void 0 ? _a : {});
            tools[action.name] = (0, ai_1.tool)({
                description: action.description,
                parameters: paramsSchema,
                execute: (paramsSchema) => __awaiter(this, void 0, void 0, function* () { return action.function(paramsSchema); }),
            });
        });
        const { toolCalls } = yield (0, ai_1.generateText)({
            model: (0, groq_1.groq)(model),
            tools,
            system: `You are ${agent.name}. Your primary function is ${agent.description}. You can perform the following actions: ${actionNames}.`,
            prompt: "",
            maxSteps: 10
        });
    });
}
exports.AgentCall = AgentCall;
function AgentCallWithAnswer(agent, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const actionNames = agent.actions.map(action => action.name).join(", ");
        const tools = {};
        agent.actions.forEach(action => {
            var _a;
            const paramsSchema = zod_1.z.object((_a = action.params) !== null && _a !== void 0 ? _a : {});
            tools[action.name] = (0, ai_1.tool)({
                description: action.description,
                parameters: paramsSchema,
                execute: (paramsSchema) => __awaiter(this, void 0, void 0, function* () { return action.function(paramsSchema); }),
            });
        });
        tools["answer"] = (0, ai_1.tool)({
            description: "A tool for providing the final answer",
            parameters: zod_1.z.object({
                steps: zod_1.z.array(zod_1.z.object({
                    action_taken: zod_1.z.string(),
                    reason_why: zod_1.z.string()
                })),
                answer: zod_1.z.string()
            })
        });
        const { toolCalls } = yield (0, ai_1.generateText)({
            model: (0, groq_1.groq)(model),
            tools,
            system: `You are ${agent.name}. Your primary function is ${agent.description}. You can perform the following actions: ${actionNames}.`,
            prompt: "",
            maxSteps: 10
        });
        console.log(`Tool Calls: ${JSON.stringify(toolCalls, null, 2)}`);
    });
}
exports.AgentCallWithAnswer = AgentCallWithAnswer;
const DefaultSystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`;
exports.DefaultSystemPrompt = DefaultSystemPrompt;
const DefaultAgentBody = {
    id: "00000000000000000000",
    name: "Master Agent",
    description: "Agent for orchestrating other agents with the aim of achieving a predefined task, You have access to the following actions: useTerminal. findAgent",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on a terminal. Currently restricted to installing npm packages",
            type: "Execution",
            params: zod_1.z.array(types_1.DependencyTypeSchema),
            function: (params) => (0, tools_1.UseTerminal)(params)
        },
        {
            name: "findAgent",
            description: "Search for an agent to orchestrate with based off a description of the agent",
            type: "Retrieval",
            params: zod_1.z.object({ description: zod_1.z.string() }),
            function: function (params) {
                return __awaiter(this, void 0, void 0, function* () {
                    const response = yield FindAgentByDes(params.description);
                    return {
                        status: "200",
                        responseBody: { agent: response }
                    };
                });
            }
        }
    ]
};
exports.DefaultAgentBody = DefaultAgentBody;
function FindAgent(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // Dummy Implementation
        const agent = {
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
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to create a post
                        const response = yield fetch('https://api.example.com/create_post', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(params)
                        });
                        const data = yield response.json();
                        return { status: response.status.toString(), message: data.message };
                    })
                },
                {
                    name: "fetch_data",
                    type: "Retrieval",
                    description: "Fetches data from the X social media platform",
                    params: {
                        param1: "example"
                    },
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to fetch data
                        const response = yield fetch(`https://api.example.com/fetch_data?param1=${params.param1}`);
                        const data = yield response.json();
                        return { status: response.status.toString(), responseBody: data };
                    })
                }
            ]
        };
        return agent;
    });
}
exports.FindAgent = FindAgent;
function FindAgentByDes(description) {
    "use server";
    return __awaiter(this, void 0, void 0, function* () {
        // Dummy Implementation
        const agent = {
            id: "0987654321",
            name: "Y-Agent",
            description: description,
            actions: [
                {
                    name: "update_status",
                    type: "Execution",
                    description: "Updates the status on the Y social media platform",
                    params: {
                        status: "example status"
                    },
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to update status
                        const response = yield fetch('https://api.example.com/update_status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(params)
                        });
                        const data = yield response.json();
                        return { status: response.status.toString(), message: data.message };
                    })
                },
                {
                    name: "get_user_info",
                    type: "Retrieval",
                    description: "Retrieves user information from the Y social media platform",
                    params: {
                        userId: "exampleUserId"
                    },
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to get user information
                        const response = yield fetch(`https://api.example.com/get_user_info?userId=${params.userId}`);
                        const data = yield response.json();
                        return { status: response.status.toString(), responseBody: data };
                    })
                }
            ]
        };
        return agent;
    });
}
