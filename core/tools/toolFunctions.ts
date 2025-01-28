import { spawn } from "child_process";
import { CommandResult } from "../types";

async function executeCommand(command:string): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
        // Validate the command
        const allowedCommands = ['bun install', 'npm install'];
        if (!allowedCommands.includes(command)) {
            reject(new Error('Command not allowed'));
            return;
        }

        // Spawn the process
        const args = command.split(' ');
        const process = spawn(args[0], args.slice(1));

        // Buffers to accumulate stdout and stderr
        let stdout = '';
        let stderr = '';

        // Handle stdout data
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // Handle stderr data
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process completion
        process.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
            } else {
                resolve({ stdout: stdout.trim(), stderr: `${stderr.trim()}` });
            }
        });

        // Handle process errors
        process.on('error', (err) => {
            reject({ stdout: '', stderr: err.message });
        });
    });
}

export { executeCommand };