import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, message: "Too many attempts, try again later" },
});

export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: { success: false, message: "Too many submissions, try again later" },
});