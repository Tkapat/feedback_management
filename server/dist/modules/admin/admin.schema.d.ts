import { z } from "zod";
export declare const statusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "in_review", "resolved", "rejected"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "in_review" | "resolved" | "rejected";
}, {
    status: "pending" | "in_review" | "resolved" | "rejected";
}>;
export declare const replySchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const settingsSchema: z.ZodEffects<z.ZodObject<{
    feedbackOpen: z.ZodBoolean;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    currentCycle: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    feedbackOpen: boolean;
    currentCycle: string;
    tags: string[];
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
}, {
    feedbackOpen: boolean;
    currentCycle: string;
    tags: string[];
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
}>, {
    feedbackOpen: boolean;
    currentCycle: string;
    tags: string[];
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
}, {
    feedbackOpen: boolean;
    currentCycle: string;
    tags: string[];
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
}>;
//# sourceMappingURL=admin.schema.d.ts.map