"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(60),
    email: zod_1.z.string().trim().toLowerCase().email(),
    rollNo: zod_1.z.string().trim().min(2).max(20),
    department: zod_1.z.string().min(1, "Select a department"),
    password: zod_1.z.string().min(8)
        .regex(/[A-Za-z]/, "Must contain a letter")
        .regex(/[0-9]/, "Must contain a number"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.enum(["student", "admin"]),
});
//# sourceMappingURL=auth.schema.js.map