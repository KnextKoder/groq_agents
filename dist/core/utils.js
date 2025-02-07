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
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 *
 * @param action `string` variable to represent log data
 * @param stream `boolean` variable for streaming logs
 */
function Logger(actionType, action, stream) {
    return __awaiter(this, void 0, void 0, function* () {
        const actionLoggerFilePath = "./core/memory/actionLogs.md";
        const logEntry = {
            actionType: actionType,
            timestamp: new Date().toISOString(),
            action: action
        };
        const markdownEntry = `- **${logEntry.timestamp}**: [${logEntry.actionType}] - ${logEntry.action}\n`;
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
