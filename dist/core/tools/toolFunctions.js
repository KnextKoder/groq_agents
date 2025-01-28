"use strict";
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
exports.executeCommand = void 0;
const child_process_1 = require("child_process");
function executeCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // Validate the command
            const allowedCommands = ['bun install', 'npm install'];
            if (!allowedCommands.includes(command)) {
                reject(new Error('Command not allowed'));
                return;
            }
            // Spawn the process
            const args = command.split(' ');
            const process = (0, child_process_1.spawn)(args[0], args.slice(1));
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
                }
                else {
                    resolve({ stdout: stdout.trim(), stderr: `${stderr.trim()}` });
                }
            });
            // Handle process errors
            process.on('error', (err) => {
                reject({ stdout: '', stderr: err.message });
            });
        });
    });
}
exports.executeCommand = executeCommand;
