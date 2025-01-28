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
exports.UseTerminal = void 0;
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
