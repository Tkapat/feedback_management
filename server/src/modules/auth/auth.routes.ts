import { Router } from "express";
import * as ctrl from "./auth.controller";
import { protect } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimit";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.me);
export default router;