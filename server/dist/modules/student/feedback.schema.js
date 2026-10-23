"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackSchema = void 0;
const zod_1 = require("zod");
const objectId = zod_1.z.string().length(24);
exports.feedbackSchema = zod_1.z
    .object({
    category: zod_1.z.enum(["teaching", "classroom", "laboratory", "other"]),
    type: zod_1.z.enum(["appreciation", "complaint", "suggestion"]),
    department: objectId,
    subject: objectId.optional(),
    faculty: objectId.optional(),
    rating: zod_1.z.number().int().min(1).max(5).optional(),
    tags: zod_1.z.array(zod_1.z.string().trim().max(30)).max(5).default([]),
    comment: zod_1.z.string().trim().min(10).max(1000),
    isAnonymous: zod_1.z.boolean().default(false),
})
    .refine((d) => d.category !== "teaching" || (d.subject && d.faculty && d.rating), {
    message: "Teaching feedback needs subject, faculty and rating",
    path: ["rating"],
});
//# sourceMappingURL=feedback.schema.js.map