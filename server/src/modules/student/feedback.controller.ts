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