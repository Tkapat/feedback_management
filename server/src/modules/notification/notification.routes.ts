import { Router } from "express";
import * as ctrl from "./notification.controller";
import { protect } from "../../middleware/auth";

const router = Router();
router.use(protect);

router.get("/mine", ctrl.listMyNotifications);
router.patch("/:id/read", ctrl.markRead);
router.patch("/all/read", ctrl.markAllRead);

export default router;
