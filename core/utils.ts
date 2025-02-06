import { AgentType } from "./agents";
import { DependencyTypeSchema, FindAgentParams, FindAgentParamsSchema, ParamsType, ResponseParamsSchema, ToolUseModels } from "./types";
import { FindAgentByDes, TerminalParamsSchema, UseTerminal } from "./tools/tools";
import * as fs from "fs";
import * as path from "path"


interface LogEntry {
    timestamp: string;
    action: string;
}


const DefaultSystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`;

const DefaultAgentBody: AgentType = {
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
};


async function Logger(action: string, stream: boolean) {
    const actionLoggerFilePath = "./core/memory/actionLogs.md";
    
    const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        action: action
    };

    const markdownEntry = `- **${logEntry.timestamp}**: ${logEntry.action}\n`;

    try {
        // Create directory if it doesn't exist
        const dir = path.dirname(actionLoggerFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (stream) {
            const wStream = fs.createWriteStream(actionLoggerFilePath, { flags: 'a' });
            wStream.write(markdownEntry, (err) => {
                if (err) {
                    console.error("Action Logging Error: ", err);
                }
            });
            wStream.end();
        } else {
            let existingContent = '';
            if (fs.existsSync(actionLoggerFilePath)) {
                existingContent = fs.readFileSync(actionLoggerFilePath, 'utf8');
            }
            const updatedContent = existingContent + markdownEntry;
            fs.writeFileSync(actionLoggerFilePath, updatedContent);
        }
    } catch (err) {
        console.error("Action Logging Error: ", err);
    }
}

export { DefaultAgentBody, DefaultSystemPrompt, Logger };