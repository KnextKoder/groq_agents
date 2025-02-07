import { z } from "zod";
type ToolUseModels = "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "llama3-70b-8192" | "llama3-8b-8192";
type RoleType = "system" | "user" | "assistant";
type MessageType = { role: RoleType, content: string };

const DependencyTypeSchema = z.record(z.string())
    .describe("The package to install and the version to install")
    .refine(
        (deps) => Object.keys(deps).length > 0,
        "At least one dependency must be specified"
    );

const FindAgentParamsSchema = z.object({ description: z.string() });
const ResponseParamsSchema = z.object({response: z.string()})
type FindAgentParams = z.infer<typeof FindAgentParamsSchema>;
type DependencyType = z.infer<typeof DependencyTypeSchema>;
type ParamsType<P extends z.ZodTypeAny> = z.infer<P>;
type CommandResult = {
    stdout: string;
    stderr: string;
};

export { ToolUseModels, RoleType, MessageType, DependencyType, CommandResult, DependencyTypeSchema, ParamsType, FindAgentParams, FindAgentParamsSchema, ResponseParamsSchema };