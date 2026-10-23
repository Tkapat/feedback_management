"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCsv = exports.reply = exports.togglePriority = exports.updateStatus = exports.getOne = exports.list = exports.buildFilter = void 0;
const Feedback_1 = __importDefault(require("../../models/Feedback"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const HttpError_1 = require("../../utils/HttpError");
const pagination_1 = require("../../utils/pagination");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildFilter = (q) => {
    const f = {};
    ["department", "subject", "faculty", "type", "category", "status"].forEach((k) => {
        if (typeof q[k] === "string" && q[k])
            f[k] = q[k];
    });
    if (q.priority === "true")
        f.priority = true;
    if (q.from || q.to) {
        const range = {};
        if (q.from)
            range.$gte = new Date(String(q.from));
        if (q.to)
            range.$lte = new Date(new Date(String(q.to)).setHours(23, 59, 59, 999));
        f.createdAt = range;
    }
    if (typeof q.search === "string" && q.search) {
        f.comment = { $regex: escapeRegex(q.search), $options: "i" };
    }
    return f;
};
exports.buildFilter = buildFilter;
const sanitize = (doc) => {
    const obj = doc.toObject();
    if (obj.isAnonymous)
        obj.student = null;
    return obj;
};
const populateAll = [
    { path: "student", select: "name rollNo email" },
    { path: "faculty", select: "name" },
    { path: "subject", select: "name code" },
    { path: "department", select: "name code" },
];
exports.list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const filter = (0, exports.buildFilter)(req.query);
    const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { priority: -1, createdAt: -1 };
    const [items, total] = await Promise.all([
        Feedback_1.default.find(filter).sort(sort).skip(skip).limit(limit).populate(populateAll),
        Feedback_1.default.countDocuments(filter),
    ]);
    res.json({
        success: true,
        data: items.map(sanitize),
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
exports.getOne = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const fb = await Feedback_1.default.findById(req.params.id).populate(populateAll);
    if (!fb)
        throw new HttpError_1.HttpError(404, "Feedback not found");
    res.json({ success: true, data: sanitize(fb) });
});
exports.updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const fb = await Feedback_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!fb)
        throw new HttpError_1.HttpError(404, "Feedback not found");
    res.json({ success: true, data: { id: fb._id, status: fb.status } });
});
exports.togglePriority = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const fb = await Feedback_1.default.findById(req.params.id);
    if (!fb)
        throw new HttpError_1.HttpError(404, "Feedback not found");
    fb.priority = !fb.priority;
    await fb.save();
    res.json({ success: true, data: { id: fb._id, priority: fb.priority } });
});
exports.reply = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const fb = await Feedback_1.default.findById(req.params.id);
    if (!fb)
        throw new HttpError_1.HttpError(404, "Feedback not found");
    fb.replies.push({ admin: req.user._id, message: req.body.message });
    if (fb.status === "pending")
        fb.status = "in_review";
    await fb.save();
    res.status(201).json({ success: true, data: { status: fb.status, replies: fb.replies } });
});
exports.exportCsv = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const items = await Feedback_1.default.find((0, exports.buildFilter)(req.query))
        .sort({ createdAt: -1 })
        .limit(5000)
        .populate(populateAll);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = "Date,Department,Subject,Faculty,Category,Type,Rating,Status,Comment,Student";
    const rows = items.map((f) => [
        f.createdAt.toISOString().slice(0, 10), f.department?.name, f.subject?.name, f.faculty?.name,
        f.category, f.type, f.rating, f.status, f.comment,
        f.isAnonymous ? "Anonymous" : f.student?.name,
    ].map(esc).join(","));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
    res.send([header, ...rows].join("\n"));
});
//# sourceMappingURL=feedback.controller.js.map