"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjects = exports.faculty = exports.departments = void 0;
const Department_1 = __importDefault(require("../../models/Department"));
const Faculty_1 = __importDefault(require("../../models/Faculty"));
const Subject_1 = __importDefault(require("../../models/Subject"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const HttpError_1 = require("../../utils/HttpError");
const crud = (Model, opts = {}) => ({
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const filter = {};
        if (req.query.department)
            filter.department = req.query.department;
        if (req.query.active === "true")
            filter.isActive = true;
        const data = await Model.find(filter).populate((opts.populate ?? "")).sort({ name: 1 });
        res.json({ success: true, data });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        res.status(201).json({ success: true, data: await Model.create(req.body) });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc)
            throw new HttpError_1.HttpError(404, "Not found");
        res.json({ success: true, data: doc });
    }),
    remove: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = String(req.params.id);
        if (opts.guard)
            await opts.guard(id);
        const doc = await Model.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!doc)
            throw new HttpError_1.HttpError(404, "Not found");
        res.json({ success: true, data: doc });
    }),
});
exports.departments = crud(Department_1.default, {
    guard: async (id) => {
        const [f, s] = await Promise.all([
            Faculty_1.default.exists({ department: id, isActive: true }),
            Subject_1.default.exists({ department: id, isActive: true }),
        ]);
        if (f || s)
            throw new HttpError_1.HttpError(409, "Deactivate its faculty and subjects first");
    },
});
exports.faculty = crud(Faculty_1.default, { populate: "department" });
exports.subjects = crud(Subject_1.default, { populate: "department faculty" });
//# sourceMappingURL=masterData.controller.js.map