import { executeCommand } from "./toolFunctions";
import { CommandResult, DependencyType, ParamsType } from "../types";

async function UseTerminal(params: ParamsType): Promise<{status: "200"|"400"|"500", message: string}> {
    const dependencies: DependencyType[] = params as DependencyType[];
    const command = `npm install ${dependencies.map(dep => `${dep.package}@${dep.version}`).join(" ")}`;
    const result: CommandResult = await executeCommand(command);
    return {
        status: result.stderr ? "500" : "200",
        message: result.stderr || result.stdout
    };
}

export { UseTerminal };