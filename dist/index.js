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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqAgent = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const utils_1 = require("./core/utils");
const agents_1 = require("./core/agents");
class GroqAgent {
    constructor(api_key, model) {
        this.api_key = api_key;
        this.model = model;
        this.GroqClient = new groq_sdk_1.default({ apiKey: api_key });
    }
    /**
     * This method lists all the available agents and their agent id. Select a specific agent by calling the `agent` method and with the agent's id as a parameter
     *
     * @returns an array of agents data
     * @example `{
     *   agent_name: string,
     * agent_id: string,
     * description: string
     * }[]`
     */
    agents() {
        const groq_client = this.GroqClient;
        console.log([
            {
                agent_name: "X Agent",
                agent_id: "101",
                description: "Agent that interfaces with the X social media platform"
            }
        ]);
        // should return {agent_name: string, agent_id: string, description: string}[]
    }
    /**
     * Method to select an agent
     * @param id Identification to select a specific agent to use. Call the `agents` method to see a list of available agents
     *
     * @returns an `Agent Type`
     */
    selectAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = yield (0, utils_1.FindAgent)(id);
            return agent;
        });
    }
    call(agent, answer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (answer == true) {
                const callingResult = yield (0, utils_1.AgentCallWithAnswer)(agent, this.model);
            }
            else {
                const callingResult = yield (0, utils_1.AgentCall)(agent, this.model);
            }
        });
    }
    /**
     * @returns an array of tool calling models that are available to power any agent
     */
    models() {
        return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"];
    }
    /**
     * Method to create an Agent instance and interact with it
     * @param system Optional system message to initialize the agent
     * @param agentBody Optional, the raw code that defines an agent. Of type `AgentType`
     * @param task String that defines the task the agent is to accomplish
     * @returns an instance of the Agent class
     */
    create(task, system, agentBody) {
        return new agents_1.Agent(system, agentBody, this.model, task);
    }
    installDependencies(dependencies) { }
}
exports.GroqAgent = GroqAgent;
function Demo() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new GroqAgent("api_key", 'llama3-70b-8192');
        console.log(client.models()); // logs all available models
        client.agents(); // logs all available agents +> should log all available agent
        const agent = client.create("Write a poem", "You are a poet");
        agent.messages[-1].content; // logs the last message content
    });
}
exports.default = GroqAgent;
