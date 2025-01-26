"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyTypeSchema = void 0;
const zod_1 = require("zod");
const DependencyTypeSchema = zod_1.z.object({ package: zod_1.z.string(), version: zod_1.z.string() });
exports.DependencyTypeSchema = DependencyTypeSchema;
