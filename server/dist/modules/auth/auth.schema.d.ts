import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    rollNo: z.ZodString;
    department: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    rollNo: string;
    department: string;
}, {
    name: string;
    email: string;
    password: string;
    rollNo: string;
    department: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["student", "admin"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "student" | "admin";
}, {
    email: string;
    password: string;
    role: "student" | "admin";
}>;
//# sourceMappingURL=auth.schema.d.ts.map