"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseParamsSchema = exports.FindAgentParamsSchema = exports.DependencyTypeSchema = void 0;
const zod_1 = require("zod");
const DependencyTypeSchema = zod_1.z.record(zod_1.z.string())
    .describe("The package to install and the version to install")
    .refine((deps) => Object.keys(deps).length > 0, "At least one dependency must be specified");
exports.DependencyTypeSchema = DependencyTypeSchema;
const FindAgentParamsSchema = zod_1.z.object({ description: zod_1.z.string() });
exports.FindAgentParamsSchema = FindAgentParamsSchema;
const ResponseParamsSchema = zod_1.z.object({ response: zod_1.z.string() });
exports.ResponseParamsSchema = ResponseParamsSchema;
