# ADMIN BACKEND PLAN

## Responsibilities
Admin login (via shared auth), master data CRUD, student management, feedback review
(filter, reply, status, priority, export), analytics aggregation, system settings.

## Base rule
Every /api/admin/* route runs: protect → authorize("admin").

## Endpoints
### Feedback
| Method | Route | Purpose |
| GET   | /api/admin/feedback              | list, filters + pagination |
| GET   | /api/admin/feedback/export       | CSV of filtered results (declare BEFORE /:id) |
| GET   | /api/admin/feedback/:id          | detail |
| PATCH | /api/admin/feedback/:id/status   | pending | in_review | resolved | rejected |
| PATCH | /api/admin/feedback/:id/priority | toggle priority |
| POST  | /api/admin/feedback/:id/reply    | add reply (pending auto-moves to in_review) |
Filters: department, subject, faculty, type, category, status, priority, from, to, search, page, limit, sort

### Stats (all accept ?from=&to=)
| GET | /api/admin/stats/overview    | KPIs, byType, byStatus, monthly trend |
| GET | /api/admin/stats/faculty     | per-faculty avg rating + counts |
| GET | /api/admin/stats/subjects    | per-subject |
| GET | /api/admin/stats/departments | per-department |
| GET | /api/admin/stats/top         | top 5 complaints/appreciations (faculty + dept) |
| GET | /api/admin/stats/concerns    | top tags + top complaint keywords |

### Master data (departments, faculty, subjects)
GET / POST /api/admin/{resource}
PUT / DELETE /api/admin/{resource}/:id   (DELETE = soft delete, isActive:false)

### Students
GET /api/admin/students?search=&department=&page=
PATCH /api/admin/students/:id/active

### Settings
PUT /api/admin/settings  { feedbackOpen, startDate, endDate, currentCycle, tags[] }

## Business rules
1. Anonymous feedback: student field is stripped in the API response, even for admin.
2. Soft delete only, so old feedback keeps valid references.
3. Cannot deactivate a department that still has active faculty/subjects (409).
4. Reply on a pending item auto-moves it to in_review.
5. Settings is a singleton document.
6. Admin accounts exist only via seed script. No public route creates admins.
7. Escape user search text before building a regex.

## Aggregation plan
- overview: $match(date) → $facet(totals, byType, byStatus, monthly)
- faculty/subject/department: $match → $group(avg rating + counts per type) → $lookup → $project → $sort
- top: reuse grouped stats, sort by complaints/appreciations desc, limit 5
- tags: $unwind tags → $group → $sort → $limit 10
- keywords: fetch complaint comments, drop stop words in JS, count

## Indexes
{faculty,type} {department,type} {status,createdAt} {student,createdAt} text(comment)

## Test checklist
- Student token on /admin/* → 403
- Anonymous feedback response has student = null
- Faculty avg rating matches manual calculation on seed data
- Soft-deleted faculty hidden in student dropdowns, still visible on old feedback
- Reply on pending → status becomes in_review

## Important codes to use--


ts
// server/src/modules/admin/admin.schema.ts
import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["pending", "in_review", "resolved", "rejected"]),
});

export const replySchema = z.object({
  message: z.string().trim().min(2).max(500),
});

export const settingsSchema = z.object({
  feedbackOpen: z.boolean(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  currentCycle: z.string().min(3),
  tags: z.array(z.string().trim().min(2).max(30)).max(20),
}).refine(
  (d) => !d.startDate || !d.endDate || d.endDate > d.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);
ts
// server/src/modules/admin/feedback.controller.ts
import { Request } from "express";
import { FilterQuery } from "mongoose";
import Feedback, { IFeedback } from "../../models/Feedback";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";
import { getPagination } from "../../utils/pagination";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildFilter = (q: Request["query"]): FilterQuery<IFeedback> => {
  const f: Record<string, unknown> = {};
  (["department", "subject", "faculty", "type", "category", "status"] as const).forEach((k) => {
    if (typeof q[k] === "string" && q[k]) f[k] = q[k];
  });
  if (q.priority === "true") f.priority = true;
  if (q.from || q.to) {
    const range: Record<string, Date> = {};
    if (q.from) range.$gte = new Date(String(q.from));
    if (q.to) range.$lte = new Date(new Date(String(q.to)).setHours(23, 59, 59, 999));
    f.createdAt = range;
  }
  if (typeof q.search === "string" && q.search) {
    f.comment = { $regex: escapeRegex(q.search), $options: "i" };
  }
  return f;
};

// Anonymity is enforced HERE (API level), not in the UI
const sanitize = (doc: any) => {
  const obj = doc.toObject();
  if (obj.isAnonymous) obj.student = null;
  return obj;
};

const populateAll = [
  { path: "student", select: "name rollNo email" },
  { path: "faculty", select: "name" },
  { path: "subject", select: "name code" },
  { path: "department", select: "name code" },
];

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildFilter(req.query);
  const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { priority: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Feedback.find(filter).sort(sort as any).skip(skip).limit(limit).populate(populateAll),
    Feedback.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items.map(sanitize),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id).populate(populateAll);
  if (!fb) throw new HttpError(404, "Feedback not found");
  res.json({ success: true, data: sanitize(fb) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const fb = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!fb) throw new HttpError(404, "Feedback not found");
  res.json({ success: true, data: { id: fb._id, status: fb.status } });
});

export const togglePriority = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id);
  if (!fb) throw new HttpError(404, "Feedback not found");
  fb.priority = !fb.priority;
  await fb.save();
  res.json({ success: true, data: { id: fb._id, priority: fb.priority } });
});

export const reply = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id);
  if (!fb) throw new HttpError(404, "Feedback not found");

  fb.replies.push({ admin: req.user!._id, message: req.body.message } as any);
  if (fb.status === "pending") fb.status = "in_review"; // auto-move
  await fb.save();

  res.status(201).json({ success: true, data: { status: fb.status, replies: fb.replies } });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const items = await Feedback.find(buildFilter(req.query))
    .sort({ createdAt: -1 })
    .limit(5000)
    .populate(populateAll);

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = "Date,Department,Subject,Faculty,Category,Type,Rating,Status,Comment,Student";
  const rows = items.map((f: any) =>
    [
      f.createdAt.toISOString().slice(0, 10), f.department?.name, f.subject?.name, f.faculty?.name,
      f.category, f.type, f.rating, f.status, f.comment,
      f.isAnonymous ? "Anonymous" : f.student?.name,
    ].map(esc).join(",")
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
  res.send([header, ...rows].join("\n"));
});
ts
// server/src/utils/keywords.ts
const STOP = new Set(
  "the and but are was were been with from this that these those have has had does did very too can will just not our your their they them also than then there here what when which while would could should about into over more most some such only other".split(" ")
);

export const topKeywords = (comments: string[], limit = 15) => {
  const counts: Record<string, number> = {};
  for (const c of comments) {
    for (const w of c.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)) {
      if (w.length > 3 && !STOP.has(w)) counts[w] = (counts[w] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};
ts
// server/src/modules/admin/stats.controller.ts
import { Request } from "express";
import Feedback from "../../models/Feedback";
import { asyncHandler } from "../../utils/asyncHandler";
import { topKeywords } from "../../utils/keywords";

const dateMatch = (q: Request["query"]) => {
  if (!q.from && !q.to) return {};
  const range: Record<string, Date> = {};
  if (q.from) range.$gte = new Date(String(q.from));
  if (q.to) range.$lte = new Date(new Date(String(q.to)).setHours(23, 59, 59, 999));
  return { createdAt: range };
};

const countIf = (field: string, value: string) => ({
  $sum: { $cond: [{ $eq: [field, value] }, 1, 0] },
});

// One reusable pipeline for faculty / subject / department stats
// NOTE: Mongoose pluralizes model names: Faculty → "faculties"
const groupedStats = (groupField: string, collection: string) => (req: Request) =>
  Feedback.aggregate([
    { $match: { ...dateMatch(req.query), [groupField]: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: `$${groupField}`,
        total: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        complaints: countIf("$type", "complaint"),
        appreciations: countIf("$type", "appreciation"),
        suggestions: countIf("$type", "suggestion"),
      },
    },
    { $lookup: { from: collection, localField: "_id", foreignField: "_id", as: "ref" } },
    { $unwind: "$ref" },
    {
      $project: {
        name: "$ref.name", total: 1, complaints: 1, appreciations: 1, suggestions: 1,
        avgRating: { $round: [{ $ifNull: ["$avgRating", 0] }, 2] },
      },
    },
    { $sort: { total: -1 } },
  ]);

const facultyStats = groupedStats("faculty", "faculties");
const subjectStats = groupedStats("subject", "subjects");
const departmentStats = groupedStats("department", "departments");

export const overview = asyncHandler(async (req, res) => {
  const [r] = await Feedback.aggregate([
    { $match: dateMatch(req.query) },
    {
      $facet: {
        totals: [{
          $group: {
            _id: null, total: { $sum: 1 }, avgRating: { $avg: "$rating" },
            pending: countIf("$status", "pending"), resolved: countIf("$status", "resolved"),
          },
        }],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        monthly: [
          { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const t = r.totals[0] ?? { total: 0, avgRating: 0, pending: 0, resolved: 0 };
  res.json({
    success: true,
    data: {
      total: t.total,
      avgRating: Number((t.avgRating || 0).toFixed(2)),
      pending: t.pending,
      resolvedPercent: t.total ? Math.round((t.resolved / t.total) * 100) : 0,
      byType: r.byType.map((x: any) => ({ name: x._id, value: x.count })),
      byStatus: r.byStatus.map((x: any) => ({ name: x._id, value: x.count })),
      monthly: r.monthly.map((x: any) => ({ month: x._id, count: x.count })),
    },
  });
});

export const faculty = asyncHandler(async (req, res) => res.json({ success: true, data: await facultyStats(req) }));
export const subjects = asyncHandler(async (req, res) => res.json({ success: true, data: await subjectStats(req) }));
export const departments = asyncHandler(async (req, res) => res.json({ success: true, data: await departmentStats(req) }));

export const top = asyncHandler(async (req, res) => {
  const [fac, dep] = await Promise.all([facultyStats(req), departmentStats(req)]);
  const topBy = (arr: any[], key: string) =>
    arr.filter((x) => x[key] > 0).sort((a, b) => b[key] - a[key]).slice(0, 5);

  res.json({
    success: true,
    data: {
      facultyComplaints: topBy(fac, "complaints"),
      facultyAppreciations: topBy(fac, "appreciations"),
      departmentComplaints: topBy(dep, "complaints"),
      departmentAppreciations: topBy(dep, "appreciations"),
    },
  });
});

export const concerns = asyncHandler(async (req, res) => {
  const match = dateMatch(req.query);
  const [tags, complaints] = await Promise.all([
    Feedback.aggregate([
      { $match: match }, { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    Feedback.find({ ...match, type: "complaint" }).select("comment").limit(2000).lean(),
  ]);
  res.json({
    success: true,
    data: {
      tags: tags.map((t) => ({ tag: t._id, count: t.count })),
      keywords: topKeywords(complaints.map((c) => c.comment)),
    },
  });
});
ts
// server/src/modules/admin/masterData.controller.ts
import { Model } from "mongoose";
import Department from "../../models/Department";
import Faculty from "../../models/Faculty";
import Subject from "../../models/Subject";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";

// One factory → list / create / update / soft-delete for any model
const crud = (Model: Model<any>, opts: { populate?: string; guard?: (id: string) => Promise<void> } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.active === "true") filter.isActive = true;
    const data = await Model.find(filter).populate(opts.populate ?? "").sort({ name: 1 });
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await Model.create(req.body) });
  }),
  update: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) throw new HttpError(404, "Not found");
    res.json({ success: true, data: doc });
  }),
  remove: asyncHandler(async (req, res) => {
    if (opts.guard) await opts.guard(req.params.id);
    const doc = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doc) throw new HttpError(404, "Not found");
    res.json({ success: true, data: doc });
  }),
});

export const departments = crud(Department, {
  guard: async (id) => {
    const [f, s] = await Promise.all([
      Faculty.exists({ department: id, isActive: true }),
      Subject.exists({ department: id, isActive: true }),
    ]);
    if (f || s) throw new HttpError(409, "Deactivate its faculty and subjects first");
  },
});
export const faculty = crud(Faculty, { populate: "department" });
export const subjects = crud(Subject, { populate: "department faculty" });
ts
// server/src/modules/admin/students.controller.ts
import User from "../../models/User";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";
import { getPagination } from "../../utils/pagination";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter: Record<string, unknown> = { role: "student" };
  if (req.query.department) filter.department = req.query.department;
  if (typeof req.query.search === "string" && req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { rollNo: rx }];
  }
  const [data, total] = await Promise.all([
    User.find(filter).populate("department", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const toggleActive = asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: "student" });
  if (!u) throw new HttpError(404, "Student not found");
  u.isActive = !u.isActive;
  await u.save();
  res.json({ success: true, data: { id: u._id, isActive: u.isActive } });
});
ts
// server/src/modules/admin/settings.controller.ts
import { asyncHandler } from "../../utils/asyncHandler";
import { getSettings } from "../../utils/settings";

export const update = asyncHandler(async (req, res) => {
  const s = await getSettings();
  Object.assign(s, req.body);
  await s.save();
  res.json({ success: true, data: s });
});
ts
// server/src/modules/admin/admin.routes.ts
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
router.get("/feedback/export", fb.exportCsv); // must be above /:id
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
