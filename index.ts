import Groq from 'groq-sdk';
import {Agent} from './agents'
import {FindAgent} from './core'

interface GroqAgentType {
    model: string;
}

export class GroqAgent implements GroqAgentType {
    private api_key: string;
    private GroqClient: Groq;
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    public model: string;


    constructor(api_key: string, model: string) {
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
        const groq_client = this.GroqClient
        // console.log(groq_client.models)
        console.log([
            {
                agent_name: "X Agent",
                agent_id: "101",
                description: "Agent that interfaces with the X social media platform"
            }
        ])
        // should return {agent_name: string, agent_id: string, description: string}[]
    }

    /**
     * Method to select an agent
     * @param id Identification to select a specific agent to use. Call the `agents` method to see a list of available agents
     * 
     * @returns an `Agent Type`
     */
    public async selectAgent(id: string) {
        const agent = await FindAgent(id)

        return agent
    }
}

const agentClient = new GroqAgent('', '')
async () => {
    const agent = await agentClient.selectAgent("12345")
    agent
}

// x.chat.completions.create()

export default GroqAgent;

// const GA = new GroqAgent("", ""),
// const twitter_agent = GA.agents("Agent ID")
// twitter_agent.post(data)
// twitter_agent.like(data)