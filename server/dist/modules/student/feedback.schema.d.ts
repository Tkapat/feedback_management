import { z } from "zod";
export declare const feedbackSchema: z.ZodEffects<z.ZodObject<{
    category: z.ZodEnum<["teaching", "classroom", "laboratory", "other"]>;
    type: z.ZodEnum<["appreciation", "complaint", "suggestion"]>;
    department: z.ZodString;
    subject: z.ZodOptional<z.ZodString>;
    faculty: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    comment: z.ZodString;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    department: string;
    type: "appreciation" | "complaint" | "suggestion";
    comment: string;
    tags: string[];
    category: "teaching" | "classroom" | "laboratory" | "other";
    isAnonymous: boolean;
    faculty?: string | undefined;
    subject?: string | undefined;
    rating?: number | undefined;
}, {
    department: string;
    type: "appreciation" | "complaint" | "suggestion";
    comment: string;
    category: "teaching" | "classroom" | "laboratory" | "other";
    faculty?: string | undefined;
    tags?: string[] | undefined;
    subject?: string | undefined;
    rating?: number | undefined;
    isAnonymous?: boolean | undefined;
}>, {
    department: string;
    type: "appreciation" | "complaint" | "suggestion";
    comment: string;
    tags: string[];
    category: "teaching" | "classroom" | "laboratory" | "other";
    isAnonymous: boolean;
    faculty?: string | undefined;
    subject?: string | undefined;
    rating?: number | undefined;
}, {
    department: string;
    type: "appreciation" | "complaint" | "suggestion";
    comment: string;
    category: "teaching" | "classroom" | "laboratory" | "other";
    faculty?: string | undefined;
    tags?: string[] | undefined;
    subject?: string | undefined;
    rating?: number | undefined;
    isAnonymous?: boolean | undefined;
}>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
//# sourceMappingURL=feedback.schema.d.ts.map