"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.summary = exports.mine = exports.create = void 0;
const mongoose_1 = require("mongoose");
const Feedback_1 = __importDefault(require("../../models/Feedback"));
const Subject_1 = __importDefault(require("../../models/Subject"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const HttpError_1 = require("../../utils/HttpError");
const pagination_1 = require("../../utils/pagination");
const settings_1 = require("../../utils/settings");
const populateRefs = [
    { path: "faculty", select: "name" },
    { path: "subject", select: "name code" },
    { path: "department", select: "name code" },
];
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const settings = await (0, settings_1.getSettings)();
    if (!(0, settings_1.isWindowOpen)(settings))
        throw new HttpError_1.HttpError(403, "Feedback is currently closed");
    if (body.tags.some((t) => !settings.tags.includes(t)))
        throw new HttpError_1.HttpError(400, "Invalid tag selected");
    const teaching = body.category === "teaching";
    if (teaching) {
        const sub = await Subject_1.default.findOne({ _id: body.subject, isActive: true });
        if (!sub || String(sub.department) !== body.department || String(sub.faculty) !== body.faculty) {
            throw new HttpError_1.HttpError(400, "Subject, faculty and department do not match");
        }
    }
    const feedback = await Feedback_1.default.create({
        student: req.user._id,
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
exports.mine = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const filter = { student: req.user._id };
    if (req.query.status)
        filter.status = req.query.status;
    if (req.query.type)
        filter.type = req.query.type;
    const [items, total] = await Promise.all([
        Feedback_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .select("-replies.admin").populate(populateRefs).lean(),
        Feedback_1.default.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.summary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rows = await Feedback_1.default.aggregate([
        { $match: { student: new mongoose_1.Types.ObjectId(String(req.user._id)) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const data = { total: 0, pending: 0, in_review: 0, resolved: 0, rejected: 0 };
    rows.forEach((r) => { data[r._id] = r.count; data.total += r.count; });
    res.json({ success: true, data });
});
exports.getOne = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const item = await Feedback_1.default.findOne({ _id: req.params.id, student: req.user._id })
        .select("-replies.admin").populate(populateRefs).lean();
    if (!item)
        throw new HttpError_1.HttpError(404, "Feedback not found");
    res.json({ success: true, data: item });
});
//# sourceMappingURL=feedback.controller.js.map