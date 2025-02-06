"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.DefaultSystemPrompt = exports.DefaultAgentBody = void 0;
const types_1 = require("./types");
const tools_1 = require("./tools/tools");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DefaultSystemPrompt = `
You are an AI agent designed to assist with various tasks. Your primary objective is to achieve the task and return a desired response, or return a reason as to why you are unable to achieve this task. You are able to orchestrate other agents similar yourself, but are more focused on interfacing with a specific service, api or sdk in order to achieve predefined tasks efficiently.
`;
exports.DefaultSystemPrompt = DefaultSystemPrompt;
const DefaultAgentBody = {
    id: "000000000000   ",
    name: "Master Agent",
    description: "Agent for orchestrating other agents with the aim of achieving a predefined task",
    actions: [
        {
            name: "useTerminal",
            description: "Execute commands on a terminal. **Currently restricted to installing npm packages",
            type: "Execution",
            params: tools_1.TerminalParamsSchema,
            handlerKey: "useTerminal_handler",
        },
        {
            name: "findAgent",
            description: "Search and retrieve other agents to orchestrate with based off a description of the agent",
            type: "Retrieval",
            params: types_1.FindAgentParamsSchema,
            handlerKey: "findAgent_handler",
        },
        {
            name: "Response Tool",
            description: "return a response for tasks that do not require tools to accomplish, like replyng to a user",
            type: "Custom",
            params: types_1.ResponseParamsSchema,
            handlerKey: "response_handler",
        }
    ]
};
exports.DefaultAgentBody = DefaultAgentBody;
function Logger(action, stream) {
    return __awaiter(this, void 0, void 0, function* () {
        const actionLoggerFilePath = "./core/memory/actionLogs.md";
        const logEntry = {
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
            }
            else {
                let existingContent = '';
                if (fs.existsSync(actionLoggerFilePath)) {
                    existingContent = fs.readFileSync(actionLoggerFilePath, 'utf8');
                }
                const updatedContent = existingContent + markdownEntry;
                fs.writeFileSync(actionLoggerFilePath, updatedContent);
            }
        }
        catch (err) {
            console.error("Action Logging Error: ", err);
        }
    });
}
exports.Logger = Logger;
