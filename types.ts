interface GroqAgentType {
    model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192";
}

type RoleType = "system" | "user" | "assistant";

type MessageType = {role: RoleType, content: string};
export {GroqAgentType, RoleType, MessageType}