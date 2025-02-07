import * as fs from "fs";
import * as path from "path"

type ActionTypes = "Info" | "Tool" | "Error" | "Response" | "Action" | "[WA]" | "[MA]" | ""

interface LogEntry {
    actionType: ActionTypes;
    timestamp: string;
    action: string;
}

/**
 * 
 * @param action `string` variable to represent log data
 * @param stream `boolean` variable for streaming logs
 */
async function Logger( actionType:ActionTypes, action: string, stream: boolean) {
    const actionLoggerFilePath = "./core/memory/actionLogs.md";
    
    const logEntry: LogEntry = {
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

export {Logger };