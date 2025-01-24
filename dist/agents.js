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
exports.AgentSchema = exports.ActionSchema = exports.ParamsSchema = void 0;
const zod_1 = require("zod");
exports.ParamsSchema = zod_1.z.record(zod_1.z.any());
const ExecutionResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(["200", "400", "500"]),
    message: zod_1.z.string().optional()
});
const RetrievalResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(["200", "400", "500"]),
    responseBody: zod_1.z.any().optional()
});
exports.ActionSchema = zod_1.z.object({
    /**
     * Defines the name for a specific action
     */
    actionName: zod_1.z.string(),
    /**
     * Types of action, where `Execution Types` return a predefined response with the status of their action
     * and `Retrieval Types` return a response object with the status and the response body
     */
    type: zod_1.z.enum(["Execution", "Retrieval"]),
    /**
     * Defines the action
     */
    description: zod_1.z.string(),
    /**
     * Parameters for the action, it accepts any key-value pairs where the keys are strings and the values can be of any type
     */
    params: exports.ParamsSchema.optional(),
    /**
     * Function to execute the action,
     * @returns `type of ExecutionResponseSchema` or `RetrievalResponseSchema`
     */
    function: zod_1.z.function().args(exports.ParamsSchema).returns(zod_1.z.promise(zod_1.z.union([ExecutionResponseSchema, RetrievalResponseSchema])))
});
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
    agentDescription: zod_1.z.string(),
    /**
     * Array of actions (tools) that the agent can interface with
     */
    actions: zod_1.z.array(exports.ActionSchema)
});
// Example function that takes an Action as a parameter and executes it with provided params
function executeAction(action, params) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Executing action: ${action.actionName}`);
        const result = yield action.function(params);
        console.log("Result:", result);
    });
}
// Example usage
const agent = {
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
            function: (params) => __awaiter(void 0, void 0, void 0, function* () {
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
            actionName: "fetch_data",
            type: "Retrieval",
            description: "Fetches data from the X social media platform",
            params: {
                param1: "example"
            },
            function: (params) => __awaiter(void 0, void 0, void 0, function* () {
                // Simulate an API call to fetch data
                const response = yield fetch(`https://api.example.com/fetch_data?param1=${params.param1}`);
                const data = yield response.json();
                return { status: response.status.toString(), responseBody: data };
            })
        }
    ]
};
// Validate the agent object
const validationResult = exports.AgentSchema.safeParse(agent);
if (!validationResult.success) {
    console.error(validationResult.error);
}
else {
    console.log("Agent is valid:", validationResult.data);
    // Execute an action from the agent with provided params
    const action = agent.actions[0];
    const params = { param1: "new example", param2: 100, param3: false };
    executeAction(action, params);
}
