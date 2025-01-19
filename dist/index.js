"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqAgent = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
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
     * ``{
     * agent_name: string,
     * agent_id: string,
     * description: string
     * }[]``
     */
    agents() {
        const groq_client = this.GroqClient;
        // console.log(groq_client.models)
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
     */
    agent(id) {
    }
}
exports.GroqAgent = GroqAgent;
const x = new GroqAgent('', '');
// x.chat.completions.create()
exports.default = GroqAgent;
// const GA = new GroqAgent("", ""),
// const twitter_agent = GA.agents("Agent ID")
// twitter_agent.post(data)
// twitter_agent.like(data)
