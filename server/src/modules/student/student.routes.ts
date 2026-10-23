import { Router } from "express";
import * as ctrl from "./feedback.controller";
import { protect, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { submitLimiter } from "../../middleware/rateLimit";
import { feedbackSchema } from "./feedback.schema";

const router = Router();
router.use(protect, authorize("student"));

router.post("/", submitLimiter, validate(feedbackSchema), ctrl.create);
router.get("/mine", ctrl.mine);
router.get("/mine/summary", ctrl.summary);
router.get("/mine/:id", ctrl.getOne);
export default router;