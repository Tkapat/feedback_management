import { Router } from "express";
import auth from "./modules/auth/auth.routes";
import lookup from "./modules/lookup/lookup.routes";
import student from "./modules/student/student.routes";
import admin from "./modules/admin/admin.routes";

const router = Router();
router.use("/auth", auth);
router.use("/", lookup);
router.use("/feedback", student);
router.use("/admin", admin);
export default router;