import { Router } from "express";
import { protect } from "../../middleware/auth";
import * as lookup from "./lookup.controller";

const router = Router();
router.get("/departments", lookup.departments);
router.get("/subjects", protect, lookup.subjects);
router.get("/faculty", protect, lookup.faculty);
router.get("/settings", protect, lookup.settings);
export default router;