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
            type: "Execution",
            params: {},
            handlerKey: ""
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