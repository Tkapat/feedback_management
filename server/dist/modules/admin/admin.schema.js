"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsSchema = exports.replySchema = exports.statusSchema = void 0;
const zod_1 = require("zod");
exports.statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "in_review", "resolved", "rejected"]),
});
exports.replySchema = zod_1.z.object({
    message: zod_1.z.string().trim().min(2).max(500),
});
exports.settingsSchema = zod_1.z.object({
    feedbackOpen: zod_1.z.boolean(),
    startDate: zod_1.z.coerce.date().optional().nullable(),
    endDate: zod_1.z.coerce.date().optional().nullable(),
    currentCycle: zod_1.z.string().min(3),
    tags: zod_1.z.array(zod_1.z.string().trim().min(2).max(30)).max(20),
}).refine((d) => !d.startDate || !d.endDate || d.endDate > d.startDate, { message: "End date must be after start date", path: ["endDate"] });
//# sourceMappingURL=admin.schema.js.map