import { executeCommand } from "./toolFunctions";
import { CommandResult, DependencyType, ParamsType } from "../types";
import { AgentType } from "../agents";

async function UseTerminal(params: ParamsType): Promise<{status: "200"|"400"|"500", message: string}> {
    const dependencies: DependencyType[] = params as DependencyType[];
    const command = `npm install ${dependencies.map(dep => `${dep.package}@${dep.version}`).join(" ")}`;
    const result: CommandResult = await executeCommand(command);
    return {
        status: result.stderr ? "500" : "200",
        message: result.stderr || result.stdout
    };
}


async function FindAgentByDes(description:string): Promise<AgentType> {
    "use server"
    // Dummy Implementation
    const agent: AgentType = {
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
                function: async (params) => {
                    // Simulate an API call to update status
                    const response = await fetch('https://api.example.com/update_status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(params)
                    });
                    const data = await response.json();
                    return { status: response.status.toString() as "200" | "400" | "500", message: data.message };
                }
            },
            {
                name: "get_user_info",
                type: "Retrieval",
                description: "Retrieves user information from the Y social media platform",
                params: {
                    userId: "exampleUserId"
                },
                function: async (params) => {
                    // Simulate an API call to get user information
                    const response = await fetch(`https://api.example.com/get_user_info?userId=${params.userId}`);
                    const data = await response.json();
                    return { status: response.status.toString() as "200" | "400" | "500", responseBody: { "data": data } };
                }
            }
        ]
    };

    return agent;
}


export { UseTerminal, FindAgentByDes };