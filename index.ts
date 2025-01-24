import Groq from 'groq-sdk';
import { AgentCall, FindAgent } from './core';
import { Agent } from './agents';

interface GroqAgentType {
    model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192";
}

export class GroqAgent implements GroqAgentType {
    private api_key: string;
    private GroqClient: Groq;
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    public model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192";

    constructor(api_key: string, model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192") {
        this.api_key = api_key;
        this.model = model;
        this.GroqClient = new Groq({ apiKey: api_key });
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
    public agents() {
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
    public async selectAgent(id: string) {
        const agent = await FindAgent(id);

        return agent;
    }

    public async call(agent:Agent) {
        const callingResult = await AgentCall(agent, this.model)
    }
}

const agentClient = new GroqAgent("", 'llama-3.3-70b-versatile');

async function Fetch(id: string) {
    const agent = await agentClient.selectAgent(id);
    const agentCall = await agentClient.call(agent)
}
const x_agent = agentClient.selectAgent("");
x_agent.then((agentbody) => {
    return agentbody;
});

// x.chat.completions.create()

export default GroqAgent;

// const GA = new GroqAgent("", ""),
// const twitter_agent = GA.agents("Agent ID")
// twitter_agent.post(data)
// twitter_agent.like(data)