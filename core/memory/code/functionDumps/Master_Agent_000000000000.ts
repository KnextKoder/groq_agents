// MasterAgent_00000000000000000000.ts

import { Logger } from "../../../utils";
import { TerminalParamsSchema, UseTerminal } from "../../../tools/tools";
import {FindAgentParamsSchema, ResponseParamsSchema} from "../../../types";
import { AgentType } from "../../../agents";

export const useTerminal_handler = async (params: Record<string, any>) => {
    const validatedParams = TerminalParamsSchema.parse(params);
    Logger(`[Tool] UseTerminal Tool called`, true);
    Logger(`[Tool] UseTerminal Params: ${JSON.stringify(validatedParams)}`, true);
    return await UseTerminal(validatedParams);
  };
  
export const findAgent_handler = async (params: Record<string, any>) => {
    const validatedParams = FindAgentParamsSchema.parse(params);
    Logger(`[Tool] findAgent Tool called`, true);
    Logger(`[Tool] findAgent Params: ${JSON.stringify(validatedParams)}`, true);

    const agent = await FindAgentByDesc(validatedParams.description);
    
    return {
      status: "200",
      responseBody: { agent: agent }
    };
};
  
export const response_handler = async (params: Record<string, any>) => {
    const validatedParams = ResponseParamsSchema.parse(params);
    Logger(`[Tool] Response Tool called`, true);
    Logger(`[Tool] Response Tool Params: ${JSON.stringify(validatedParams)}`, true);
    Logger(`[Tool] Response Tool Response: ${JSON.stringify(validatedParams.response)}`, true);
    return {
      status: "200",
      other: validatedParams.response
    };
};

async function FindAgentByDesc(description:string): Promise<AgentType> {
    Logger(`[Tool] FindAgentByDesc called with description: ${description}`, true);
    const agent:AgentType = {
        id: "238595071",
        name: "X Agent",
        description: "Agent that interfaces with the X social media platform",
        actions: [
            {
                name: "like_post",
                type: "Execution",
                description: "Like a post on the X social media platform",
                params: {},
                handlerKey: "like_post_handler"
            }
        ]
    }
    Logger(`[Tool] FindAgentByDesc Response: ${JSON.stringify(agent)}`, true);

    return agent;
}