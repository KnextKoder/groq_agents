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
const core_1 = require("./core");
const agents_1 = require("./agents");
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
            const agent = yield (0, core_1.FindAgent)(id);
            return agent;
        });
    }
    call(agent, answer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (answer == true) {
                const callingResult = yield (0, core_1.AgentCallWithAnswer)(agent, this.model);
            }
            else {
                const callingResult = yield (0, core_1.AgentCall)(agent, this.model);
            }
        });
    }
    /**
     * Method to create an Agent instance and interact with it
     * @param system Optional system message to initialize the agent
     * @returns an instance of the Agent class
     */
    createAgent(system = "", agentBody) {
        return new agents_1.Agent(this.GroqClient, system, agentBody, this.model);
    }
}
exports.GroqAgent = GroqAgent;
const agentClient = new GroqAgent("", 'llama-3.3-70b-versatile');
function Fetch(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const agentBody = yield agentClient.selectAgent(id);
        const agentCall = yield agentClient.createAgent("", agentBody);
        agentCall.__call__("Hello");
    });
}
const x_agent = agentClient.selectAgent("");
x_agent.then((agentbody) => {
    return agentbody;
});
// x.chat.completions.create()
exports.default = GroqAgent;
// const GA = new GroqAgent("", ""),
// const twitter_agent = GA.agents("Agent ID")
// twitter_agent.post(data)
// twitter_agent.like(data)
