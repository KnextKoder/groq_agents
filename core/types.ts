import { z } from "zod";

type ToolUseModels = "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192";
type RoleType = "system" | "user" | "assistant";
type MessageType = { role: RoleType, content: string };

const DependencyTypeSchema = z.object({ package: z.string(), version: z.string() });
type DependencyType = z.infer<typeof DependencyTypeSchema>;

type CommandResult = {
    stdout: string;
    stderr: string;
};

export { ToolUseModels, RoleType, MessageType, DependencyType, CommandResult, DependencyTypeSchema };