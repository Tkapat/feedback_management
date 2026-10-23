import { Model } from "mongoose";
import Department from "../../models/Department";
import Faculty from "../../models/Faculty";
import Subject from "../../models/Subject";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";

const crud = (Model: Model<any>, opts: { populate?: string; guard?: (id: string) => Promise<void> } = {}) => ({
  list: asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.active === "true") filter.isActive = true;
    const data = await Model.find(filter).populate((opts.populate ?? "") as string).sort({ name: 1 });
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
    const id = String(req.params.id);
    if (opts.guard) await opts.guard(id);
    const doc = await Model.findByIdAndUpdate(id, { isActive: false }, { new: true });
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