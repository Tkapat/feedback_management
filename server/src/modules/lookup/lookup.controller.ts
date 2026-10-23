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