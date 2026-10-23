"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = exports.faculty = exports.subjects = exports.departments = void 0;
const Department_1 = __importDefault(require("../../models/Department"));
const Subject_1 = __importDefault(require("../../models/Subject"));
const Faculty_1 = __importDefault(require("../../models/Faculty"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const settings_1 = require("../../utils/settings");
exports.departments = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.json({ success: true, data: await Department_1.default.find({ isActive: true }).select("name code").sort({ name: 1 }) });
});
exports.subjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.department)
        filter.department = req.query.department;
    const data = await Subject_1.default.find(filter)
        .select("name code semester faculty department")
        .populate("faculty", "name")
        .sort({ semester: 1, name: 1 });
    res.json({ success: true, data });
});
exports.faculty = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.department)
        filter.department = req.query.department;
    res.json({ success: true, data: await Faculty_1.default.find(filter).select("name designation department").sort({ name: 1 }) });
});
exports.settings = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.json({ success: true, data: await (0, settings_1.getSettings)() });
});
//# sourceMappingURL=lookup.controller.js.map