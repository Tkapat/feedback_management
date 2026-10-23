# STUDENT BACKEND PLAN

## Responsibilities
Register, login (shared with admin via role toggle), form lookup data, feedback submission,
personal history, detail with replies, personal status summary.

## Endpoints
| Method | Route | Auth | Purpose |
| POST | /api/auth/register       | public  | create STUDENT account only |
| POST | /api/auth/login          | public  | body includes role: "student" | "admin" |
| POST | /api/auth/logout         | any     | clear cookie |
| GET  | /api/auth/me             | any     | current user |
| GET  | /api/departments         | public  | active departments (needed on register page) |
| GET  | /api/subjects?department=| student | subjects with faculty |
| GET  | /api/faculty?department= | student | faculty list |
| GET  | /api/settings            | any logged in | feedback window + tag list |
| POST | /api/feedback            | student | submit feedback |
| GET  | /api/feedback/mine            | student | paginated history, filters: status, type |
| GET  | /api/feedback/mine/summary    | student | counts per status (declare BEFORE /:id) |
| GET  | /api/feedback/mine/:id        | student | one feedback with replies |

## Request bodies
register: { name, email, rollNo, department, password }
login:    { email, password, role }
feedback: { category, type, department, subject?, faculty?, rating?, tags[], comment, isAnonymous }

## Validation (Zod, server side)
- password min 8 with a letter and a number
- category in teaching | classroom | laboratory | other
- type in appreciation | complaint | suggestion
- category = teaching → subject, faculty, rating (1-5) required
- comment 10-1000 chars; tags max 5 and must exist in the settings tag list

## Business rules
1. Feedback accepted only while the window is open (feedbackOpen + start/end dates).
2. For teaching: subject must belong to the department and its faculty must match.
3. One teaching feedback per student + faculty + subject + cycle (unique partial index → 409).
4. Student identity is always stored, hidden from admin when isAnonymous.
5. Students read only their own feedback: every query includes student = req.user._id.
6. Deactivated students cannot log in and existing tokens stop working (checked in protect).
7. Login returns the same "Invalid credentials" message for wrong email, password or role.
8. Replies are shown as "Administrator", admin identity is never returned to students.

## Middleware chain
rateLimit → protect → authorize("student") → validate(schema) → controller

## Response shape
success: { success: true, data, meta? }    error: { success: false, message, errors? }
Codes: 400 validation · 401 not logged in · 403 wrong role / window closed · 404 · 409 duplicate · 429 · 500

## Test checklist
- Duplicate email or rollNo on register → 409
- Student token on /admin/* → 403
- Submit while window closed → 403
- Teaching without rating → 400
- Duplicate teaching feedback → 409
- Reading another student's feedback id → 404
- Admin trying student login with role "student" → 401

## Important codes to use --

// server/src/modules/auth/auth.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  rollNo: z.string().trim().min(2).max(20),
  department: z.string().length(24, "Invalid department"),
  password: z.string().min(8)
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  role: z.enum(["student", "admin"]),
});
ts
// server/src/modules/auth/auth.controller.ts
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User, { IUser } from "../../models/User";
import Department from "../../models/Department";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";
import { env } from "../../config/env";
import { cookieOptions } from "../../config/cookie";

const signToken = (id: unknown) =>
  jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

const publicUser = (u: IUser & { _id: unknown }) => ({
  id: u._id, name: u.name, email: u.email, role: u.role, rollNo: u.rollNo, department: u.department,
});

// Public registration creates STUDENTS only
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, rollNo, department, password } = req.body;
  const dept = await Department.findOne({ _id: department, isActive: true });
  if (!dept) throw new HttpError(400, "Invalid department");

  const user = await User.create({ name, email, rollNo, department, password, role: "student" });
  res.cookie("token", signToken(user._id), cookieOptions);
  res.status(201).json({ success: true, data: publicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select("+password");

  // One generic message for wrong email / password / role
  if (!user || user.role !== role || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid credentials");
  }
  if (!user.isActive) throw new HttpError(403, "Your account is deactivated");

  res.cookie("token", signToken(user._id), cookieOptions);
  res.json({ success: true, data: publicUser(user) });
});

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
};

export const me = (req: Request, res: Response) =>
  res.json({ success: true, data: publicUser(req.user!) });
ts
// server/src/modules/auth/auth.routes.ts
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
ts
// server/src/modules/student/feedback.schema.ts
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
ts
// server/src/utils/settings.ts
import Setting, { ISetting } from "../models/Setting";

export const getSettings = async () =>
  (await Setting.findOne({ key: "main" })) ?? (await Setting.create({ key: "main" }));

export const isWindowOpen = (s: ISetting) => {
  if (!s.feedbackOpen) return false;
  const now = new Date();
  if (s.startDate && now < s.startDate) return false;
  if (s.endDate && now > s.endDate) return false;
  return true;
};
ts
// server/src/modules/student/feedback.controller.ts
import { Types } from "mongoose";
import Feedback from "../../models/Feedback";
import Subject from "../../models/Subject";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";
import { getPagination } from "../../utils/pagination";
import { getSettings, isWindowOpen } from "../../utils/settings";
import type { FeedbackInput } from "./feedback.schema";

const populateRefs = [
  { path: "faculty", select: "name" },
  { path: "subject", select: "name code" },
  { path: "department", select: "name code" },
];

export const create = asyncHandler(async (req, res) => {
  const body = req.body as FeedbackInput;
  const settings = await getSettings();

  if (!isWindowOpen(settings)) throw new HttpError(403, "Feedback is currently closed");
  if (body.tags.some((t) => !settings.tags.includes(t))) throw new HttpError(400, "Invalid tag selected");

  const teaching = body.category === "teaching";
  if (teaching) {
    const sub = await Subject.findOne({ _id: body.subject, isActive: true });
    if (!sub || String(sub.department) !== body.department || String(sub.faculty) !== body.faculty) {
      throw new HttpError(400, "Subject, faculty and department do not match");
    }
  }

  const feedback = await Feedback.create({
    student: req.user!._id,
    category: body.category,
    type: body.type,
    department: body.department,
    subject: teaching ? body.subject : undefined,
    faculty: teaching ? body.faculty : undefined,
    rating: teaching ? body.rating : undefined,
    tags: body.tags,
    comment: body.comment,
    isAnonymous: body.isAnonymous,
    cycle: settings.currentCycle,
  });

  res.status(201).json({ success: true, data: feedback });
});

export const mine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter: Record<string, unknown> = { student: req.user!._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select("-replies.admin").populate(populateRefs).lean(),
    Feedback.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const summary = asyncHandler(async (req, res) => {
  const rows = await Feedback.aggregate([
    { $match: { student: new Types.ObjectId(String(req.user!._id)) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const data: Record<string, number> = { total: 0, pending: 0, in_review: 0, resolved: 0, rejected: 0 };
  rows.forEach((r) => { data[r._id] = r.count; data.total += r.count; });
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Feedback.findOne({ _id: req.params.id, student: req.user!._id })
    .select("-replies.admin").populate(populateRefs).lean();
  if (!item) throw new HttpError(404, "Feedback not found");
  res.json({ success: true, data: item });
});
ts
// server/src/modules/student/student.routes.ts
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
router.get("/mine/summary", ctrl.summary); // above /mine/:id
router.get("/mine/:id", ctrl.getOne);
export default router;
ts
// server/src/modules/lookup/lookup.controller.ts
import Department from "../../models/Department";
import Subject from "../../models/Subject";
import Faculty from "../../models/Faculty";
import { asyncHandler } from "../../utils/asyncHandler";
import { getSettings } from "../../utils/settings";

export const departments = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await Department.find({ isActive: true }).select("name code").sort({ name: 1 }) });
});

export const subjects = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.department) filter.department = req.query.department;
  const data = await Subject.find(filter)
    .select("name code semester faculty department")
    .populate("faculty", "name")
    .sort({ semester: 1, name: 1 });
  res.json({ success: true, data });
});

export const faculty = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.department) filter.department = req.query.department;
  res.json({ success: true, data: await Faculty.find(filter).select("name designation department").sort({ name: 1 }) });
});

export const settings = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getSettings() });
});
ts
// server/src/modules/lookup/lookup.routes.ts
import { Router } from "express";
import { protect } from "../../middleware/auth";
import * as lookup from "./lookup.controller";

const router = Router();
router.get("/departments", lookup.departments); // public: register page needs it
router.get("/subjects", protect, lookup.subjects);
router.get("/faculty", protect, lookup.faculty);
router.get("/settings", protect, lookup.settings);
export default router;