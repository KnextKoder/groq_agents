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
const agents_1 = require("./core/agents");
class GroqAgent {
    constructor(api_key, model) {
        this.api_key = api_key;
        this.model = model;
        this.GroqClient = new groq_sdk_1.default({ apiKey: this.api_key });
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
     * @param timer Number that defines the max amount of time (in milliseconds) the agent should spend on a task. Default of 1 min
     * @returns an instance of the Agent class
     */
    create(task, system, agentBody, timer) {
        return new agents_1.Agent(system, agentBody, this.model, task, this.api_key, timer);
    }
    installDependencies(dependencies) { }
}
exports.GroqAgent = GroqAgent;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const agentClient = new GroqAgent("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", "llama-3.3-70b-versatile");
        // const agentOne = await agentClient.create("Write a poem for me", "You are a poet")
        // const response = await agentOne.work()
        const agentTwo = yield agentClient.create("Find me an AI agent for the X/twitter platform");
        const responseTwo = yield agentTwo.work();
        // console.log("Response:",response)
        console.log(responseTwo);
    });
}
main();
exports.default = GroqAgent;
