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