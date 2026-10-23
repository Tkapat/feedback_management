import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["pending", "in_review", "resolved", "rejected"]),
});

export const replySchema = z.object({
  message: z.string().trim().min(2).max(500),
});

export const settingsSchema = z.object({
  feedbackOpen: z.boolean(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  currentCycle: z.string().min(3),
  tags: z.array(z.string().trim().min(2).max(30)).max(20),
}).refine(
  (d) => !d.startDate || !d.endDate || d.endDate > d.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);