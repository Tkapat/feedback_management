import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  rollNo: z.string().min(2, "Roll number is required"),
  department: z.string().min(1, "Select a department"),
  password: z.string().min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const feedbackSchema = z.object({
  category: z.enum(["teaching", "classroom", "laboratory", "other"]),
  type: z.enum(["appreciation", "complaint", "suggestion"]),
  department: z.string().min(1, "Select a department"),
  subject: z.string().optional(),
  faculty: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).max(5),
  comment: z.string().min(10, "Write at least 10 characters").max(1000),
  isAnonymous: z.boolean(),
})
.refine((d) => d.category !== "teaching" || !!d.subject, { message: "Select a subject", path: ["subject"] })
.refine((d) => d.category !== "teaching" || !!d.rating, { message: "Please give a rating", path: ["rating"] });

export type FeedbackValues = z.infer<typeof feedbackSchema>;