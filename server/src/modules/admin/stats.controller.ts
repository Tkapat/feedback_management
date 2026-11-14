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

const groupedStats = (groupField: string, collection: string) => (req: Request) =>
  Feedback.aggregate([
    { $match: { ...dateMatch(req.query), [groupField]: { $exists: true, $ne: null } } },
    {
        $group: {
          _id: `$${groupField}`,
          total: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
    },
    { $lookup: { from: collection, localField: "_id", foreignField: "_id", as: "ref" } },
    { $unwind: "$ref" },
    {
      $project: {
        name: "$ref.name", total: 1,
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
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          },
        }],
        byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
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
      byCategory: r.byCategory.map((x: any) => ({ name: x._id, value: x.count })),
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
      topFaculty: topBy(fac, "total"),
      topDepartment: topBy(dep, "total"),
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
    Feedback.find({ ...match }).select("comment").limit(2000).lean(),
  ]);
  res.json({
    success: true,
    data: {
      tags: tags.map((t) => ({ tag: t._id, count: t.count })),
      keywords: topKeywords(complaints.map((c) => c.comment)),
    },
  });
});