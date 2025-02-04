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
exports.FindAgentByDes = exports.UseTerminal = void 0;
const toolFunctions_1 = require("./toolFunctions");
function UseTerminal(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const dependencies = params;
        const command = `npm install ${dependencies.map(dep => `${dep.package}@${dep.version}`).join(" ")}`;
        const result = yield (0, toolFunctions_1.executeCommand)(command);
        return {
            status: result.stderr ? "500" : "200",
            message: result.stderr || result.stdout
        };
    });
}
exports.UseTerminal = UseTerminal;
function FindAgentByDes(description) {
    "use server";
    return __awaiter(this, void 0, void 0, function* () {
        // Dummy Implementation
        const agent = {
            id: "0987654321",
            name: "Y-Agent",
            description: description,
            actions: [
                {
                    name: "update_status",
                    type: "Execution",
                    description: "Updates the status on the Y social media platform",
                    params: {
                        status: "example status"
                    },
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to update status
                        const response = yield fetch('https://api.example.com/update_status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(params)
                        });
                        const data = yield response.json();
                        return { status: response.status.toString(), message: data.message };
                    })
                },
                {
                    name: "get_user_info",
                    type: "Retrieval",
                    description: "Retrieves user information from the Y social media platform",
                    params: {
                        userId: "exampleUserId"
                    },
                    function: (params) => __awaiter(this, void 0, void 0, function* () {
                        // Simulate an API call to get user information
                        const response = yield fetch(`https://api.example.com/get_user_info?userId=${params.userId}`);
                        const data = yield response.json();
                        return { status: response.status.toString(), responseBody: { "data": data } };
                    })
                }
            ]
        };
        return agent;
    });
}
exports.FindAgentByDes = FindAgentByDes;
