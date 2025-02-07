"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalParamsSchema = exports.SystemPrompt = exports.AgentBody = void 0;
const zod_1 = require("zod");
const types_1 = require("../../../types");
const TerminalParamsSchema = zod_1.z.object({
    dependencies: zod_1.z.array(zod_1.z.object({
        package: zod_1.z.string(),
        version: zod_1.z.string()
    }))
});
exports.TerminalParamsSchema = TerminalParamsSchema;
const SystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`;
exports.SystemPrompt = SystemPrompt;
const AgentBody = {
    id: "000000000000   ",
    name: "Master Agent",
    description: "Agent for orchestrating other agents with the aim of achieving a predefined task",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on a terminal. **Currently restricted to installing npm packages",
            type: "Execution",
            params: TerminalParamsSchema,
            handlerKey: "useTerminal_handler",
        },
        {
            name: "findAgent",
            description: "Search and retrieve other agents to orchestrate with based off a description of the agent",
            type: "Retrieval",
            params: types_1.FindAgentParamsSchema,
            handlerKey: "findAgent_handler",
        },
        {
            name: "Response Tool",
            description: "return a response for tasks that do not require tools to accomplish, like replyng to a user",
            type: "Custom",
            params: types_1.ResponseParamsSchema,
            handlerKey: "response_handler",
        }
    ]
};
exports.AgentBody = AgentBody;
