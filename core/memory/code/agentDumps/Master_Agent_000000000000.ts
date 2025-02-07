import { z } from "zod";
import { AgentType } from "../../../agents";
import { FindAgentParamsSchema, ResponseParamsSchema } from "../../../types";


const TerminalParamsSchema = z.object({
    dependencies: z.array(
      z.object({
        package: z.string(),
        version: z.string()
      })
    )
})

type TerminalParams = z.infer<typeof TerminalParamsSchema>;


const SystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`

const AgentBody: AgentType = {
    id: "000000000000   ",
    name: "Master Agent",
    description: "Agent for orchestrating other agents with the aim of achieving a predefined task",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on a terminal. **Currently restricted to installing npm packages",
            type: "Execution",
            params: TerminalParamsSchema,
            handlerKey: "useTerminal_handler",
        },
        {
            name: "findAgent",
            description: "Search and retrieve other agents to orchestrate with based off a description of the agent",
            type: "Retrieval",
            params: FindAgentParamsSchema,
            handlerKey: "findAgent_handler",
        },
        {
            name: "Response Tool",
            description: "return a response for tasks that do not require tools to accomplish, like replyng to a user",
            type: "Custom",
            params: ResponseParamsSchema,
            handlerKey: "response_handler",
        }
    ]
}

export {AgentBody, SystemPrompt, TerminalParamsSchema}