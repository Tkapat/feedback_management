import { z } from "zod";

const objectId = z.string().length(24);

export const feedbackSchema = z
  .object({
    category: z.enum(["teaching", "classroom", "laboratory", "other"]),
    type: z.enum(["appreciation", "complaint", "suggestion"]),
    department: objectId,
    subject: objectId.optional(),
    faculty: objectId.optional(),
    rating: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string().trim().max(30)).max(5).default([]),
    comment: z.string().trim().min(10).max(1000),
    isAnonymous: z.boolean().default(false),
  })
  .refine((d) => d.category !== "teaching" || (d.subject && d.faculty && d.rating), {
    message: "Teaching feedback needs subject, faculty and rating",
    path: ["rating"],
  });

export type FeedbackInput = z.infer<typeof feedbackSchema>;