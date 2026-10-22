7. Important Code
7.1 Install commands
bash
# server
cd server
npm i express mongoose dotenv cors helmet jsonwebtoken bcryptjs cookie-parser express-rate-limit zod
npm i -D nodemon

# client
cd client
npx create-next-app@latest . --js --tailwind --app --eslint
npm i axios gsap @gsap/react recharts react-hook-form zod @hookform/resolvers react-hot-toast lucide-react

server/package.json scripts:

json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seed.js"
  }
}
7.2 Server core
js
// server/src/server.js
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

connectDB().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
js
// server/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1); // needed behind Render/Railway proxies
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
js
// server/src/config/db.js
const mongoose = require("mongoose");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
js
// server/src/config/cookie.js
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
7.3 Utilities and middleware
js
// server/src/utils/asyncHandler.js
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
js
// server/src/utils/httpError.js
module.exports = (status, message, errors) => {
  const err = new Error(message);
  err.status = status;
  err.errors = errors;
  return err;
};
js
// server/src/utils/pagination.js
module.exports = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
js
// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw httpError(401, "Not authenticated");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw httpError(401, "Account not available");

  req.user = user;
  next();
});

exports.authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role) ? next() : next(httpError(403, "Access denied"));
js
// server/src/middleware/validate.js
const httpError = require("../utils/httpError");

module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(httpError(400, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};
js
// server/src/middleware/rateLimit.js
const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
});

exports.submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many submissions, try again later" },
});
js
// server/src/middleware/errorHandler.js
exports.notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Session expired, please login again";
  }
  if (err.code === 11000) {
    status = 409;
    message = "Duplicate entry: this record already exists";
  }
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  }
  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message, errors: err.errors });
};
7.4 Validators
js
// server/src/validators/auth.schema.js
const { z } = require("zod");

exports.registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  rollNo: z.string().trim().min(2).max(20),
  department: z.string().length(24, "Invalid department"),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/[0-9]/, "Must contain a number"),
});

exports.loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  role: z.enum(["student", "admin"]),
});
js
// server/src/validators/feedback.schema.js
const { z } = require("zod");

const objectId = z.string().length(24);

exports.feedbackSchema = z
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
  .refine(
    (d) => d.category !== "teaching" || (d.subject && d.faculty && d.rating),
    { message: "Teaching feedback needs subject, faculty and rating", path: ["rating"] }
  );

exports.statusSchema = z.object({
  status: z.enum(["pending", "in_review", "resolved", "rejected"]),
});

exports.replySchema = z.object({
  message: z.string().trim().min(2).max(500),
});
7.5 Auth controller and routes
js
// server/src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Department = require("../models/Department");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const cookieOptions = require("../config/cookie");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  rollNo: u.rollNo,
  department: u.department,
});

// Public registration is for STUDENTS only
exports.register = asyncHandler(async (req, res) => {
  const { name, email, rollNo, department, password } = req.body;

  const dept = await Department.findOne({ _id: department, isActive: true });
  if (!dept) throw httpError(400, "Invalid department");

  const user = await User.create({ name, email, rollNo, department, password, role: "student" });

  res.cookie("token", signToken(user._id), cookieOptions);
  res.status(201).json({ success: true, data: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // Same message for every failure so nothing leaks (wrong email / password / role)
  if (!user || user.role !== role || !(await user.comparePassword(password))) {
    throw httpError(401, "Invalid credentials");
  }
  if (!user.isActive) throw httpError(403, "Your account is deactivated");

  res.cookie("token", signToken(user._id), cookieOptions);
  res.json({ success: true, data: publicUser(user) });
});

exports.logout = (req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
};

exports.me = (req, res) => res.json({ success: true, data: publicUser(req.user) });
js
// server/src/routes/auth.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.schema");

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.me);

module.exports = router;
js
// server/src/routes/index.js
const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/", require("./lookup.routes"));   // departments, subjects, faculty, settings
router.use("/feedback", require("./student.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;
7.6 Student feedback controller and routes
js
// server/src/controllers/student/feedback.controller.js
const Feedback = require("../../models/Feedback");
const Subject = require("../../models/Subject");
const Setting = require("../../models/Setting");
const asyncHandler = require("../../utils/asyncHandler");
const httpError = require("../../utils/httpError");
const getPagination = require("../../utils/pagination");

const isWindowOpen = (s) => {
  if (!s.feedbackOpen) return false;
  const now = new Date();
  if (s.startDate && now < s.startDate) return false;
  if (s.endDate && now > s.endDate) return false;
  return true;
};

exports.create = asyncHandler(async (req, res) => {
  const settings = await Setting.getSingleton();
  if (!isWindowOpen(settings)) throw httpError(403, "Feedback is currently closed");

  const { category, type, department, subject, faculty, rating, tags, comment, isAnonymous } =
    req.body;

  // Tags must exist in the admin-managed list
  if (tags.some((t) => !settings.tags.includes(t))) throw httpError(400, "Invalid tag selected");

  if (category === "teaching") {
    const sub = await Subject.findOne({ _id: subject, isActive: true });
    if (!sub || String(sub.department) !== department || String(sub.faculty) !== faculty) {
      throw httpError(400, "Subject, faculty and department do not match");
    }
  }

  const feedback = await Feedback.create({
    student: req.user._id,
    category,
    type,
    department,
    subject: category === "teaching" ? subject : undefined,
    faculty: category === "teaching" ? faculty : undefined,
    rating: category === "teaching" ? rating : undefined,
    tags,
    comment,
    isAnonymous,
    cycle: settings.currentCycle,
  });

  res.status(201).json({ success: true, data: feedback });
});

exports.mine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { student: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-replies.admin")
      .populate("faculty", "name")
      .populate("subject", "name code")
      .populate("department", "name code")
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.summary = asyncHandler(async (req, res) => {
  const rows = await Feedback.aggregate([
    { $match: { student: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const data = { total: 0, pending: 0, in_review: 0, resolved: 0, rejected: 0 };
  rows.forEach((r) => {
    data[r._id] = r.count;
    data.total += r.count;
  });
  res.json({ success: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const item = await Feedback.findOne({ _id: req.params.id, student: req.user._id })
    .select("-replies.admin")
    .populate("faculty", "name")
    .populate("subject", "name code")
    .populate("department", "name code")
    .lean();
  if (!item) throw httpError(404, "Feedback not found");
  res.json({ success: true, data: item });
});
js
// server/src/routes/student.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/student/feedback.controller");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { submitLimiter } = require("../middleware/rateLimit");
const { feedbackSchema } = require("../validators/feedback.schema");

router.use(protect, authorize("student"));

router.post("/", submitLimiter, validate(feedbackSchema), ctrl.create);
router.get("/mine", ctrl.mine);
router.get("/mine/summary", ctrl.summary); // keep above /mine/:id
router.get("/mine/:id", ctrl.getOne);

module.exports = router;
7.7 Admin feedback controller (anonymity, reply, status)
js
// server/src/controllers/admin/feedback.controller.js
const Feedback = require("../../models/Feedback");
const asyncHandler = require("../../utils/asyncHandler");
const httpError = require("../../utils/httpError");
const getPagination = require("../../utils/pagination");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = (q) => {
  const f = {};
  ["department", "subject", "faculty", "type", "category", "status"].forEach((k) => {
    if (q[k]) f[k] = q[k];
  });
  if (q.priority === "true") f.priority = true;
  if (q.from || q.to) {
    f.createdAt = {};
    if (q.from) f.createdAt.$gte = new Date(q.from);
    if (q.to) f.createdAt.$lte = new Date(new Date(q.to).setHours(23, 59, 59, 999));
  }
  if (q.search) f.comment = { $regex: escapeRegex(q.search), $options: "i" };
  return f;
};

// Strip student identity for anonymous feedback, at API level
const sanitize = (fb) => {
  const obj = fb.toObject ? fb.toObject() : fb;
  if (obj.isAnonymous) obj.student = null;
  return obj;
};

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .sort(req.query.sort === "oldest" ? { createdAt: 1 } : { priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("student", "name rollNo email")
      .populate("faculty", "name")
      .populate("subject", "name code")
      .populate("department", "name code"),
    Feedback.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items.map(sanitize),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id)
    .populate("student", "name rollNo email")
    .populate("faculty", "name")
    .populate("subject", "name code")
    .populate("department", "name code");
  if (!fb) throw httpError(404, "Feedback not found");
  res.json({ success: true, data: sanitize(fb) });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const fb = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!fb) throw httpError(404, "Feedback not found");
  res.json({ success: true, data: { id: fb._id, status: fb.status } });
});

exports.togglePriority = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id);
  if (!fb) throw httpError(404, "Feedback not found");
  fb.priority = !fb.priority;
  await fb.save();
  res.json({ success: true, data: { id: fb._id, priority: fb.priority } });
});

exports.reply = asyncHandler(async (req, res) => {
  const fb = await Feedback.findById(req.params.id);
  if (!fb) throw httpError(404, "Feedback not found");

  fb.replies.push({ admin: req.user._id, message: req.body.message });
  if (fb.status === "pending") fb.status = "in_review"; // auto-move
  await fb.save();

  res.status(201).json({ success: true, data: { status: fb.status, replies: fb.replies } });
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const items = await Feedback.find(buildFilter(req.query))
    .sort({ createdAt: -1 })
    .limit(5000)
    .populate("student", "name rollNo")
    .populate("faculty", "name")
    .populate("subject", "name")
    .populate("department", "name");

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = "Date,Department,Subject,Faculty,Category,Type,Rating,Status,Comment,Student";
  const rows = items.map((f) =>
    [
      f.createdAt.toISOString().slice(0, 10),
      f.department?.name,
      f.subject?.name,
      f.faculty?.name,
      f.category,
      f.type,
      f.rating,
      f.status,
      f.comment,
      f.isAnonymous ? "Anonymous" : f.student?.name,
    ]
      .map(esc)
      .join(",")
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
  res.send([header, ...rows].join("\n"));
});
7.8 Admin stats (aggregation pipelines)
js
// server/src/utils/keywords.js
const STOP = new Set(
  "the a an and or but is are was were be been to of in on for with at by from it this that these those i we you they he she as not no very so too can will just have has had do does did my our your their".split(" ")
);

module.exports = (comments, limit = 15) => {
  const counts = {};
  comments.forEach((c) =>
    c
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
      .forEach((w) => (counts[w] = (counts[w] || 0) + 1))
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};
js
// server/src/controllers/admin/stats.controller.js
const Feedback = require("../../models/Feedback");
const asyncHandler = require("../../utils/asyncHandler");
const topKeywords = require("../../utils/keywords");

const dateMatch = (q) => {
  const m = {};
  if (q.from || q.to) {
    m.createdAt = {};
    if (q.from) m.createdAt.$gte = new Date(q.from);
    if (q.to) m.createdAt.$lte = new Date(new Date(q.to).setHours(23, 59, 59, 999));
  }
  return m;
};

const countIf = (field, value) => ({ $sum: { $cond: [{ $eq: [field, value] }, 1, 0] } });

// Reusable grouped stats: by faculty / subject / department
const groupedStats = (groupField, collection) => (req) =>
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
        name: "$ref.name",
        total: 1,
        complaints: 1,
        appreciations: 1,
        suggestions: 1,
        avgRating: { $round: [{ $ifNull: ["$avgRating", 0] }, 2] },
      },
    },
    { $sort: { total: -1 } },
  ]);

const facultyStats = groupedStats("faculty", "faculties");
const subjectStats = groupedStats("subject", "subjects");
const departmentStats = groupedStats("department", "departments");

exports.overview = asyncHandler(async (req, res) => {
  const [result] = await Feedback.aggregate([
    { $match: dateMatch(req.query) },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgRating: { $avg: "$rating" },
              pending: countIf("$status", "pending"),
              resolved: countIf("$status", "resolved"),
            },
          },
        ],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        monthly: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const t = result.totals[0] || { total: 0, avgRating: 0, pending: 0, resolved: 0 };

  res.json({
    success: true,
    data: {
      total: t.total,
      avgRating: Number((t.avgRating || 0).toFixed(2)),
      pending: t.pending,
      resolvedPercent: t.total ? Math.round((t.resolved / t.total) * 100) : 0,
      byType: result.byType.map((x) => ({ name: x._id, value: x.count })),
      byStatus: result.byStatus.map((x) => ({ name: x._id, value: x.count })),
      monthly: result.monthly.map((x) => ({ month: x._id, count: x.count })),
    },
  });
});

exports.faculty = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await facultyStats(req) })
);
exports.subjects = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await subjectStats(req) })
);
exports.departments = asyncHandler(async (req, res) =>
  res.json({ success: true, data: await departmentStats(req) })
);

exports.top = asyncHandler(async (req, res) => {
  const [fac, dep] = await Promise.all([facultyStats(req), departmentStats(req)]);
  const topBy = (arr, key) =>
    [...arr].filter((x) => x[key] > 0).sort((a, b) => b[key] - a[key]).slice(0, 5);

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

exports.concerns = asyncHandler(async (req, res) => {
  const match = dateMatch(req.query);

  const [tags, complaints] = await Promise.all([
    Feedback.aggregate([
      { $match: match },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
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

Mongoose pluralizes model names, so Faculty becomes the collection faculties. That is why the $lookup uses "faculties". Confirm collection names in Atlas.

7.9 Admin routes
js
// server/src/routes/admin.routes.js
const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { statusSchema, replySchema } = require("../validators/feedback.schema");
const fb = require("../controllers/admin/feedback.controller");
const stats = require("../controllers/admin/stats.controller");
const master = require("../controllers/admin/masterData.controller");
const students = require("../controllers/admin/student.controller");
const settings = require("../controllers/settings.controller");

router.use(protect, authorize("admin"));

// Feedback
router.get("/feedback", fb.list);
router.get("/feedback/export", fb.exportCsv); // above /:id
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

// Master data (generic CRUD factory, see below)
["departments", "faculty", "subjects"].forEach((name) => {
  router.get(`/${name}`, master[name].list);
  router.post(`/${name}`, master[name].create);
  router.put(`/${name}/:id`, master[name].update);
  router.delete(`/${name}/:id`, master[name].remove);
});

// Students
router.get("/students", students.list);
router.patch("/students/:id/active", students.toggleActive);

// Settings
router.put("/settings", settings.update);

module.exports = router;
js
// server/src/controllers/admin/masterData.controller.js
const Department = require("../../models/Department");
const Faculty = require("../../models/Faculty");
const Subject = require("../../models/Subject");
const asyncHandler = require("../../utils/asyncHandler");
const httpError = require("../../utils/httpError");

// One factory builds list/create/update/soft-delete for any model
const crud = (Model, { populate = "", guard } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.active === "true") filter.isActive = true;
    const data = await Model.find(filter).populate(populate).sort({ name: 1 });
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  }),

  update: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw httpError(404, "Not found");
    res.json({ success: true, data: doc });
  }),

  // Soft delete keeps old feedback valid
  remove: asyncHandler(async (req, res) => {
    if (guard) await guard(req.params.id);
    const doc = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doc) throw httpError(404, "Not found");
    res.json({ success: true, data: doc });
  }),
});

exports.departments = crud(Department, {
  guard: async (id) => {
    const [f, s] = await Promise.all([
      Faculty.exists({ department: id, isActive: true }),
      Subject.exists({ department: id, isActive: true }),
    ]);
    if (f || s) throw httpError(409, "Deactivate its faculty and subjects first");
  },
});
exports.faculty = crud(Faculty, { populate: "department" });
exports.subjects = crud(Subject, { populate: "department faculty" });
7.10 Lookup, settings and seed
js
// server/src/routes/lookup.routes.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const lookup = require("../controllers/lookup.controller");
const settings = require("../controllers/settings.controller");

router.get("/departments", lookup.departments); // public: needed on register page
router.get("/subjects", protect, lookup.subjects);
router.get("/faculty", protect, lookup.faculty);
router.get("/settings", protect, settings.get);

module.exports = router;
js
// server/src/controllers/lookup.controller.js
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");
const asyncHandler = require("../utils/asyncHandler");

exports.departments = asyncHandler(async (req, res) => {
  const data = await Department.find({ isActive: true }).select("name code").sort({ name: 1 });
  res.json({ success: true, data });
});

exports.subjects = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.department) filter.department = req.query.department;
  const data = await Subject.find(filter)
    .select("name code semester faculty department")
    .populate("faculty", "name")
    .sort({ semester: 1, name: 1 });
  res.json({ success: true, data });
});

exports.faculty = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.department) filter.department = req.query.department;
  const data = await Faculty.find(filter).select("name designation department").sort({ name: 1 });
  res.json({ success: true, data });
});
js
// server/src/controllers/settings.controller.js
const Setting = require("../models/Setting");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await Setting.getSingleton() });
});

exports.update = asyncHandler(async (req, res) => {
  const { feedbackOpen, startDate, endDate, currentCycle, tags } = req.body;
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    throw httpError(400, "End date must be after start date");
  }
  const s = await Setting.getSingleton();
  Object.assign(s, { feedbackOpen, startDate, endDate, currentCycle, tags });
  await s.save();
  res.json({ success: true, data: s });
});
js
// server/src/seed/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const Feedback = require("../models/Feedback");
const Setting = require("../models/Setting");

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Wiping old data...");
  await Promise.all(
    [User, Department, Faculty, Subject, Feedback, Setting].map((M) => M.deleteMany({}))
  );

  const settings = await Setting.create({ key: "main" });

  const departments = await Department.insertMany([
    { name: "Computer Engineering", code: "COMP" },
    { name: "Information Technology", code: "IT" },
    { name: "Electronics", code: "EXTC" },
    { name: "Mechanical", code: "MECH" },
  ]);

  const names = ["Dr. Mehta", "Prof. Sharma", "Prof. Iyer", "Dr. Khan", "Prof. Patil", "Dr. Rao"];
  const faculty = [];
  for (const [i, d] of departments.entries()) {
    for (let j = 0; j < 3; j++) {
      faculty.push(
        await Faculty.create({
          name: `${names[(i + j) % names.length]} ${String.fromCharCode(65 + i * 3 + j)}`,
          department: d._id,
        })
      );
    }
  }

  const subjects = [];
  for (const f of faculty) {
    const d = departments.find((x) => String(x._id) === String(f.department));
    subjects.push(
      await Subject.create({
        name: `${d.code} Subject ${subjects.length + 1}`,
        code: `${d.code}${100 + subjects.length}`,
        semester: (subjects.length % 8) + 1,
        department: d._id,
        faculty: f._id,
      })
    );
  }

  await User.create({
    name: "System Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });

  const students = [];
  for (let i = 1; i <= 20; i++) {
    students.push(
      await User.create({
        name: `Student ${i}`,
        email: i === 1 ? "student@college.edu" : `student${i}@college.edu`,
        password: "Student@123",
        rollNo: `R${1000 + i}`,
        department: pick(departments)._id,
      })
    );
  }

  const comments = {
    appreciation: "Excellent explanations and very helpful in doubt clearing sessions.",
    complaint: "Lectures often start late and the syllabus is covered too quickly.",
    suggestion: "Please add more practical examples and weekly revision sessions.",
  };

  const used = new Set();
  for (let i = 0; i < 120; i++) {
    const sub = pick(subjects);
    const student = pick(students);
    const key = `${student._id}-${sub._id}`;
    if (used.has(key)) continue;
    used.add(key);

    const type = pick(["appreciation", "complaint", "suggestion"]);
    const date = new Date(Date.now() - Math.floor(Math.random() * 150) * 86400000);

    await Feedback.create({
      student: student._id,
      department: sub.department,
      subject: sub._id,
      faculty: sub.faculty,
      category: "teaching",
      type,
      rating: type === "appreciation" ? pick([4, 5]) : type === "complaint" ? pick([1, 2, 3]) : pick([3, 4]),
      tags: [pick(settings.tags)],
      comment: comments[type],
      isAnonymous: Math.random() > 0.6,
      status: pick(["pending", "in_review", "resolved"]),
      cycle: settings.currentCycle,
      createdAt: date,
      updatedAt: date,
    });
  }

  console.log("Seed complete");
  console.log(`Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  console.log("Student: student@college.edu / Student@123");
  process.exit(0);
})();
7.11 Client config
js
// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF2FF", 100: "#E0E7FF", 500: "#6366F1",
          600: "#4F46E5", 700: "#4338CA",
        },
        accent: { 500: "#14B8A6" },
        ink: { 900: "#0F172A", 600: "#475569", 400: "#94A3B8" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)",
        lift: "0 12px 32px rgba(79,70,229,.15)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
css
/* client/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-slate-50 text-ink-900 antialiased; }
  h1, h2, h3 { @apply font-display; }
  :focus-visible { @apply outline-none ring-2 ring-primary-500 ring-offset-2; }
}

@layer components {
  .card { @apply rounded-2xl border border-slate-200 bg-white shadow-soft; }
  .input {
    @apply w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
           transition placeholder:text-ink-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }

js
// client/app/layout.js
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata = { title: "College Feedback System" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
js
// client/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send the httpOnly cookie
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.userMessage = err.response?.data?.message || "Something went wrong";
    return Promise.reject(err);
  }
);

export default api;
js
// client/context/AuthContext.js
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload); // { email, password, role }
    setUser(data.data);
    return data.data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setUser(data.data);
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
js
// client/components/auth/ProtectedRoute.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <div className="grid min-h-screen place-items-center"><div className="skeleton h-10 w-40 rounded-xl" /></div>;
  }
  return children;
}
js
// client/app/student/layout.js   (admin/layout.js is identical with role="admin")
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";

export default function StudentLayout({ children }) {
  return (
    <ProtectedRoute role="student">
      <DashboardShell role="student">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
js
// client/app/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(!user ? "/login" : user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  }, [user, loading, router]);
  return null;
}
7.12 Role toggle and login (GSAP)
js
// client/components/auth/RoleToggle.js
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { GraduationCap, ShieldCheck } from "lucide-react";

const OPTIONS = [
  { value: "student", label: "Student", Icon: GraduationCap },
  { value: "admin", label: "Admin", Icon: ShieldCheck },
];

export default function RoleToggle({ value, onChange }) {
  const wrap = useRef(null);
  const pill = useRef(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const x = value === "admin" ? "100%" : "0%";
      gsap.to(pill.current, {
        xPercent: value === "admin" ? 100 : 0,
        duration: first.current ? 0 : 0.45,
        ease: "power3.inOut",
      });
      first.current = false;
    },
    { dependencies: [value], scope: wrap }
  );

  return (
    <div
      ref={wrap}
      role="tablist"
      aria-label="Login as"
      className="relative grid grid-cols-2 rounded-2xl bg-slate-100 p-1"
    >
      <span
        ref={pill}
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-soft"
      />
      {OPTIONS.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            value === v ? "text-primary-600" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  );
}
js
// client/lib/validators.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  rollNo: z.string().min(2, "Roll number is required"),
  department: z.string().min(1, "Select a department"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
});

export const feedbackSchema = z
  .object({
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
js
// client/components/ui/Button.js
"use client";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
  secondary: "bg-white text-ink-900 border border-slate-200 hover:bg-slate-50",
  ghost: "text-ink-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
        transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
js
// client/components/ui/Input.js
import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-600">{label}</span>}
      <input ref={ref} className={`input ${error ? "border-red-400" : ""} ${className}`} {...props} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});

export default Input;
js
// client/components/auth/LoginForm.js
"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/validators";
import RoleToggle from "./RoleToggle";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const COPY = {
  student: { title: "Welcome back", sub: "Sign in to share and track your feedback." },
  admin: { title: "Admin console", sub: "Sign in to manage feedback and analytics." },
};

export default function LoginForm() {
  const [role, setRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const root = useRef(null);
  const textRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Entrance animation
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(root.current.querySelectorAll("[data-anim]"), {
          y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08,
        });
      });
    },
    { scope: root }
  );

  // Crossfade heading text when role changes
  const changeRole = (next) => {
    if (next === role) return;
    gsap.to(textRef.current, {
      opacity: 0, y: -8, duration: 0.18,
      onComplete: () => {
        setRole(next);
        gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      },
    });
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login({ ...values, role });
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={root} className="w-full max-w-md">
      <div data-anim>
        <RoleToggle value={role} onChange={changeRole} />
      </div>

      <div ref={textRef} data-anim className="mt-8">
        <h1 className="text-3xl font-bold">{COPY[role].title}</h1>
        <p className="mt-2 text-ink-600">{COPY[role].sub}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div data-anim>
          <Input label="Email" type="email" placeholder="you@college.edu"
            error={errors.email?.message} {...register("email")} />
        </div>
        <div data-anim>
          <Input label="Password" type="password" placeholder="••••••••"
            error={errors.password?.message} {...register("password")} />
        </div>
        <div data-anim>
          <Button type="submit" loading={submitting} className="w-full">
            Sign in as {role === "admin" ? "Admin" : "Student"}
          </Button>
        </div>
      </form>

      {role === "student" && (
        <p data-anim className="mt-6 text-center text-sm text-ink-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}
js
// client/app/(auth)/layout.js
export default function AuthLayout({ children }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
        <h2 className="relative text-xl font-bold">🎓 CampusVoice</h2>
        <div className="relative">
          <h3 className="text-4xl font-bold leading-tight">Your voice shapes a better campus.</h3>
          <p className="mt-4 max-w-md text-white/80">
            Share feedback on teaching, classrooms and facilities. Track every response in one place.
          </p>
        </div>
        <p className="relative text-sm text-white/60">College Feedback Management System</p>
      </aside>
      <section className="flex items-center justify-center p-6 sm:p-12">{children}</section>
    </main>
  );
}
js
// client/app/(auth)/login/page.js
import LoginForm from "@/components/auth/LoginForm";
export default function LoginPage() {
  return <LoginForm />;
}

7.16 Student feedback form (dependent dropdowns, conditional fields)
js
// client/components/feedback/StarRating.js
"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);
  const refs = useRef([]);

  const pick = (n) => {
    onChange(n);
    gsap.fromTo(
      refs.current[n - 1],
      { scale: 1 },
      { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "back.out(3)" }
    );
  };

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            ref={(el) => (refs.current[n - 1] = el)}
            onClick={() => pick(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="p-1"
          >
            <Star size={30} className={filled ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
          </button>
        );
      })}
    </div>
  );
}
js
// client/components/feedback/TagSelector.js
export default function TagSelector({ options = [], value = [], onChange, max = 5 }) {
  const toggle = (tag) => {
    if (value.includes(tag)) return onChange(value.filter((t) => t !== tag));
    if (value.length < max) onChange([...value, tag]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const on = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              on ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-200 text-ink-600 hover:bg-slate-50"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
js
// client/components/feedback/FeedbackForm.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { feedbackSchema } from "@/lib/validators";
import useFetch from "@/hooks/useFetch";
import StarRating from "./StarRating";
import TagSelector from "./TagSelector";
import Button from "@/components/ui/Button";

const CATEGORIES = [
  { value: "teaching", label: "Teaching" },
  { value: "classroom", label: "Classroom" },
  { value: "laboratory", label: "Laboratory" },
  { value: "other", label: "Other services" },
];
const TYPES = [
  { value: "appreciation", label: "Appreciation" },
  { value: "complaint", label: "Complaint" },
  { value: "suggestion", label: "Suggestion" },
];

const Chip = ({ active, children, ...p }) => (
  <button
    type="button"
    {...p}
    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
      active ? "border-primary-600 bg-primary-600 text-white" : "border-slate-200 bg-white text-ink-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, error, children }) => (
  <div>
    <p className="mb-2 text-sm font-medium text-ink-600">{label}</p>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default function FeedbackForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const { data: departments } = useFetch("/departments");
  const { data: settings } = useFetch("/settings");

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "teaching", type: "appreciation", department: "", subject: "",
      faculty: "", rating: undefined, tags: [], comment: "", isAnonymous: false,
    },
  });

  const category = watch("category");
  const department = watch("department");
  const subjectId = watch("subject");
  const isTeaching = category === "teaching";

  // Department → load its subjects
  useEffect(() => {
    setValue("subject", "");
    setValue("faculty", "");
    setSubjects([]);
    if (!department) return;
    api.get("/subjects", { params: { department } }).then((r) => setSubjects(r.data.data));
  }, [department, setValue]);

  // Subject → auto-fill faculty
  const selectedSubject = subjects.find((s) => s._id === subjectId);
  useEffect(() => {
    setValue("faculty", selectedSubject?.faculty?._id || "");
  }, [selectedSubject, setValue]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (!isTeaching) { delete payload.subject; delete payload.faculty; delete payload.rating; }
      await api.post("/feedback", payload);
      toast.success("Feedback submitted. Thank you!");
      router.push("/student/feedback/history");
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const closed = settings && !settings.feedbackOpen;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-7 p-6 sm:p-8">
      {closed && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Feedback is currently closed by the administrator.
        </div>
      )}

      <Field label="Category">
        <Controller name="category" control={control} render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.value} active={field.value === c.value} onClick={() => field.onChange(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>
        )} />
      </Field>

      <Field label="Feedback type">
        <Controller name="type" control={control} render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip key={t.value} active={field.value === t.value} onClick={() => field.onChange(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
        )} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Department" error={errors.department?.message}>
          <select className="input" {...register("department")}>
            <option value="">Select department</option>
            {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </Field>

        {isTeaching && (
          <Field label="Subject" error={errors.subject?.message}>
            <select className="input" disabled={!department} {...register("subject")}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} (Sem {s.semester})</option>)}
            </select>
          </Field>
        )}
      </div>

      {isTeaching && selectedSubject && (
        <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
          Faculty: <strong>{selectedSubject.faculty?.name}</strong>
        </div>
      )}

      {isTeaching && (
        <Field label="Your rating" error={errors.rating?.message}>
          <Controller name="rating" control={control} render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} />
          )} />
        </Field>
      )}

      <Field label="Quick tags (optional)">
        <Controller name="tags" control={control} render={({ field }) => (
          <TagSelector options={settings?.tags} value={field.value} onChange={field.onChange} />
        )} />
      </Field>

      <Field label="Comments" error={errors.comment?.message}>
        <textarea rows={5} maxLength={1000} className="input resize-none"
          placeholder="Tell us what went well or what can improve..." {...register("comment")} />
        <p className="mt-1 text-right text-xs text-ink-400">{watch("comment").length}/1000</p>
      </Field>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-600">
        <input type="checkbox" className="h-4 w-4 rounded accent-indigo-600" {...register("isAnonymous")} />
        Submit anonymously (your name will be hidden from the administrator)
      </label>

      <Button type="submit" loading={submitting} disabled={closed} className="w-full sm:w-auto">
        Submit feedback
      </Button>
    </form>
  );
}
js
// client/app/student/feedback/new/page.js
import PageHeader from "@/components/layout/PageHeader";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export default function NewFeedbackPage() {
  return (
    <>
      <PageHeader title="Give feedback" subtitle="Help us improve teaching and facilities." />
      <div className="max-w-3xl"><FeedbackForm /></div>
    </>
  );
}
7.17 Status timeline and reply thread
js
// client/components/feedback/StatusTimeline.js
const STEPS = ["pending", "in_review", "resolved"];
const LABEL = { pending: "Submitted", in_review: "In review", resolved: "Resolved" };

export default function StatusTimeline({ status }) {
  if (status === "rejected") {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">This feedback was rejected.</p>;
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
              i <= current ? "bg-primary-600 text-white" : "bg-slate-200 text-ink-400"}`}>
              {i + 1}
            </span>
            <span className="text-xs text-ink-600">{LABEL[s]}</span>
          </div>
          {i < STEPS.length - 1 && (
            <span className={`mx-2 mb-5 h-0.5 flex-1 ${i < current ? "bg-primary-600" : "bg-slate-200"}`} />
          )}
        </li>
      ))}
    </ol>
  );
}
js
// client/components/feedback/ReplyThread.js
export default function ReplyThread({ replies = [] }) {
  if (!replies.length) {
    return <p className="text-sm text-ink-400">No replies yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {replies.map((r) => (
        <li key={r._id} className="rounded-xl bg-primary-50 p-4">
          <div className="mb-1 flex justify-between text-xs text-ink-600">
            <span className="font-semibold text-primary-700">Administrator</span>
            <time>{new Date(r.createdAt).toLocaleString()}</time>
          </div>
          <p className="text-sm">{r.message}</p>
        </li>
      ))}
    </ul>
  );
}
7.18 Admin reply and status panel
js
// client/components/feedback/AdminFeedbackActions.js
"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

const STATUSES = ["pending", "in_review", "resolved", "rejected"];

export default function AdminFeedbackActions({ feedback, onChange }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const updateStatus = async (status) => {
    try {
      await api.patch(`/admin/feedback/${feedback._id}/status`, { status });
      toast.success("Status updated");
      onChange();
    } catch (e) { toast.error(e.userMessage); }
  };

  const sendReply = async () => {
    if (message.trim().length < 2) return;
    setBusy(true);
    try {
      await api.post(`/admin/feedback/${feedback._id}/reply`, { message });
      setMessage("");
      toast.success("Reply sent");
      onChange();
    } catch (e) { toast.error(e.userMessage); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-600">Status</label>
        <select className="input" value={feedback.status} onChange={(e) => updateStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-600">Reply to student</label>
        <textarea rows={4} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)}
          className="input resize-none" placeholder="Write a response..." />
        <Button onClick={sendReply} loading={busy} className="mt-3">Send reply</Button>
      </div>
    </div>
  );
}

Animation components
js
// client/components/animation/Reveal.js
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Wrap any group of elements: its direct children fade/slide in with a stagger
export default function Reveal({ children, className = "", y = 24, stagger = 0.08, delay = 0 }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current.children, {
          y, opacity: 0, duration: 0.7, delay, stagger, ease: "power3.out",
        });
      });
    },
    { scope: ref }
  );

  return <div ref={ref} className={className}>{children}</div>;
}
js
// client/components/animation/AnimatedCounter.js
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AnimatedCounter({ value = 0, decimals = 0, suffix = "" }) {
  const el = useRef(null);

  useGSAP(
    () => {
      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          if (el.current) el.current.textContent = obj.n.toFixed(decimals) + suffix;
        },
      });
    },
    { dependencies: [value] }
  );

  return <span ref={el}>{(0).toFixed(decimals) + suffix}</span>;
}
js
// client/components/animation/HoverLift.js
"use client";
import { useRef } from "react";
import gsap from "gsap";

export default function HoverLift({ children, className = "" }) {
  const ref = useRef(null);
  const to = (y, shadow) =>
    gsap.to(ref.current, { y, boxShadow: shadow, duration: 0.25, ease: "power2.out" });

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={() => to(-4, "0 12px 32px rgba(79,70,229,.15)")}
      onMouseLeave={() => to(0, "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)")}
    >
      {children}
    </div>
  );
}
7.14 Dashboard components
js
// client/components/dashboard/StatCard.js
import HoverLift from "@/components/animation/HoverLift";
import AnimatedCounter from "@/components/animation/AnimatedCounter";

export default function StatCard({ label, value, decimals = 0, suffix = "", icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-sky-50 text-sky-600",
  };
  return (
    <HoverLift className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-600">{label}</p>
        {Icon && (
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </p>
    </HoverLift>
  );
}
js
// client/components/feedback/StatusBadge.js
const STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  in_review: "bg-sky-50 text-sky-700 ring-sky-200",
  resolved: "bg-green-50 text-green-700 ring-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  appreciation: "bg-green-50 text-green-700 ring-green-200",
  complaint: "bg-red-50 text-red-700 ring-red-200",
  suggestion: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STYLES[value]}`}>
      {value.replace("_", " ")}
    </span>
  );
}
js
// client/components/charts/TypeDonutChart.js
"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { appreciation: "#16A34A", complaint: "#DC2626", suggestion: "#F59E0B" };

export default function TypeDonutChart({ data }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold">Feedback by type</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {data.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
js
// client/components/charts/FacultyRatingBar.js  (same pattern for Department / Trend charts)
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function FacultyRatingBar({ data }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold">Average rating per faculty</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="avgRating" fill="#4F46E5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
js
// client/hooks/useFetch.js
"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export default function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params || {});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(url, { params: JSON.parse(key) });
      setData(res.data.data);
      setMeta(res.data.meta || null);
      setError(null);
    } catch (e) {
      setError(e.userMessage);
    } finally {
      setLoading(false);
    }
  }, [url, key]);

  useEffect(() => { load(); }, [load]);

  return { data, meta, loading, error, reload: load };
}
js
// client/app/admin/dashboard/page.js
"use client";
import { MessageSquare, Star, Clock, CheckCircle2 } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/animation/Reveal";
import StatCard from "@/components/dashboard/StatCard";
import TypeDonutChart from "@/components/charts/TypeDonutChart";
import FacultyRatingBar from "@/components/charts/FacultyRatingBar";

export default function AdminDashboard() {
  const { data: overview, loading } = useFetch("/admin/stats/overview");
  const { data: faculty } = useFetch("/admin/stats/faculty");

  if (loading || !overview) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of all student feedback" />

      <Reveal className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total feedback" value={overview.total} icon={MessageSquare} />
        <StatCard label="Average rating" value={overview.avgRating} decimals={1} icon={Star} tone="warning" />
        <StatCard label="Pending" value={overview.pending} icon={Clock} tone="info" />
        <StatCard label="Resolved" value={overview.resolvedPercent} suffix="%" icon={CheckCircle2} tone="success" />
      </Reveal>

      <Reveal className="mt-6 grid gap-5 lg:grid-cols-3" delay={0.2}>
        <div className="lg:col-span-2"><FacultyRatingBar data={(faculty || []).slice(0, 10)} /></div>
        <TypeDonutChart data={overview.byType} />
      </Reveal>
    </>
  );
}
js
// client/components/layout/PageHeader.js
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
7.15 Layout (sidebar + shell)
js
// client/constants/nav.js
import {
  LayoutDashboard, PlusCircle, History, MessageSquare, BarChart3,
  Building2, Users, BookOpen, GraduationCap, Settings,
} from "lucide-react";

export const NAV = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/feedback/new", label: "Give Feedback", icon: PlusCircle },
    { href: "/student/feedback/history", label: "My Feedback", icon: History },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/faculty", label: "Faculty", icon: Users },
    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};
js
// client/components/layout/Sidebar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/constants/nav";

export default function Sidebar({ role, open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-5 transition-transform duration-300
        lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="mb-8 px-2 font-display text-xl font-bold text-primary-600">🎓 CampusVoice</h2>
        <nav className="space-y-1">
          {NAV[role].map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-primary-50 text-primary-600" : "text-ink-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
js
// client/components/layout/Topbar.js
"use client";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-ink-400">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg p-2 text-ink-600 hover:bg-slate-100" aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
js
// client/components/layout/DashboardShell.js
"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({ role, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}