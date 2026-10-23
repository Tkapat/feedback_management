"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleActive = exports.list = void 0;
const User_1 = __importDefault(require("../../models/User"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const HttpError_1 = require("../../utils/HttpError");
const pagination_1 = require("../../utils/pagination");
exports.list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const filter = { role: "student" };
    if (req.query.department)
        filter.department = req.query.department;
    if (typeof req.query.search === "string" && req.query.search) {
        const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ name: rx }, { email: rx }, { rollNo: rx }];
    }
    const [data, total] = await Promise.all([
        User_1.default.find(filter).populate("department", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
        User_1.default.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.toggleActive = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const u = await User_1.default.findOne({ _id: req.params.id, role: "student" });
    if (!u)
        throw new HttpError_1.HttpError(404, "Student not found");
    u.isActive = !u.isActive;
    await u.save();
    res.json({ success: true, data: { id: u._id, isActive: u.isActive } });
});
//# sourceMappingURL=students.controller.js.map