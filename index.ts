import Groq from 'groq-sdk';
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
        this.GroqClient = new Groq({ apiKey: this.api_key });
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
     * @param timer Number that defines the max amount of time (in milliseconds) the agent should spend on a task. Default of 1 min
     * @returns an instance of the Agent class
     */
    public create( task:string,  system?: string, agentBody?: AgentType, timer?: number):Agent {
        return new Agent(system, agentBody, this.model, task, this.api_key, timer);
    }

    public installDependencies(dependencies:DependencyType){}
}
export default GroqAgent;

