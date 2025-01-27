import Groq from 'groq-sdk';
import { AgentCall, AgentCallWithAnswer, FindAgent } from './core/utils';
import { AgentType, Agent } from './core/agents';
import {ToolUseModels} from "./core/types"
import {DependencyType} from "./agents/agentBody"


export class GroqAgent {
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    public model: ToolUseModels
    private api_key: string;
    private GroqClient: Groq;

    constructor(api_key: string, model: ToolUseModels) {
        this.api_key = api_key;
        this.model = model;
        this.GroqClient = new Groq({ apiKey: api_key });
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

    public async call(agent: AgentType, answer: boolean) {
        if (answer == true) {
            const callingResult = await AgentCallWithAnswer(agent, this.model);
        } else {
            const callingResult = await AgentCall(agent, this.model);
        }
    }

    /** 
     * @returns an array of tool calling models that are available to power any agent 
     */ 
    public models() {
        return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"] as ToolUseModels[];
    }

    /**
     * Method to create an Agent instance and interact with it
     * @param system Optional system message to initialize the agent
     * @param agentBody Optional, the raw code that defines an agent. Of type `AgentType`
     * @param task String that defines the task the agent is to accomplish
     * @returns an instance of the Agent class
     */
    public create( task:string,  system?: string, agentBody?: AgentType):Agent {
        return new Agent(system, agentBody, this.model, task);
    }

    public installDependencies(dependencies:DependencyType){}
}

async function Demo() {
    const client = new GroqAgent("api_key", 'llama3-70b-8192')
    console.log(client.models()); // logs all available models
    client.agents(); // logs all available agents +> should log all available agent
    const agent = client.create("Write a poem", "You are a poet")
    agent.work()
    agent.messages[-1].content // logs the last message content
}


export default GroqAgent;