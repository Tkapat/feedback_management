import { Router } from "express";
import { protect, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { statusSchema, replySchema, settingsSchema } from "./admin.schema";
import * as fb from "./feedback.controller";
import * as stats from "./stats.controller";
import * as master from "./masterData.controller";
import * as students from "./students.controller";
import * as settings from "./settings.controller";

const router = Router();
router.use(protect, authorize("admin"));

// Feedback
router.get("/feedback", fb.list);
router.get("/feedback/export", fb.exportCsv);
router.get("/feedback/:id", fb.getOne);
router.patch("/feedback/:id/status", validate(statusSchema), fb.updateStatus);
router.patch("/feedback/:id/priority", fb.togglePriority);
router.post("/feedback/:id/reply", validate(replySchema), fb.reply);

// Stats
router.get("/stats/overview", stats.overview);
router.get("/stats/faculty", stats.faculty);
router.get("/stats/subjects", stats.subjects);
router.get("/stats/departments", stats.departments);
router.get("/stats/top", stats.top);
router.get("/stats/concerns", stats.concerns);

// Master data
(["departments", "faculty", "subjects"] as const).forEach((name) => {
  router.get(`/${name}`, master[name].list);
  router.post(`/${name}`, master[name].create);
  router.put(`/${name}/:id`, master[name].update);
  router.delete(`/${name}/:id`, master[name].remove);
});

// Students + settings
router.get("/students", students.list);
router.patch("/students/:id/active", students.toggleActive);
router.put("/settings", validate(settingsSchema), settings.update);

export default router;