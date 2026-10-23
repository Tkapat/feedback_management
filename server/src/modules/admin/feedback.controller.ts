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
  if (fb.status === "pending") fb.status = "in_review";
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