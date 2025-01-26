import {AgentType} from "../core/agents"
import { DependencyType } from "../core/types"

// NOTE: Some agents might require additional dependencies
interface CustomAgentType extends AgentType {
    dependencies?: DependencyType[]
}

const customAgent: CustomAgentType = {
    id: "",
    name: "",
    description: "",
    actions: [
        {
            name: "",
            description: "",
            type: "Retrieval",
            params: {},
            function: async (params) => {
                console.log(params)

                return {
                    status: "200"
                    
                }
            }
        }
    ],
    dependencies: [
        {
            package: "",
            version: "",
        }
    ]
}

export {CustomAgentType, DependencyType}