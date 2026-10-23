"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
const Department_1 = __importDefault(require("../../models/Department"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const HttpError_1 = require("../../utils/HttpError");
const env_1 = require("../../config/env");
const cookie_1 = require("../../config/cookie");
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
const publicUser = (u) => ({
    id: u._id, name: u.name, email: u.email, role: u.role, rollNo: u.rollNo, department: u.department,
});
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, rollNo, department, password } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(department);
    const dept = isObjectId
        ? await Department_1.default.findOne({ _id: department, isActive: true })
        : await Department_1.default.findOne({ code: department.toUpperCase(), isActive: true });
    if (!dept)
        throw new HttpError_1.HttpError(400, "Invalid department");
    const user = await User_1.default.create({ name, email, rollNo, department: dept._id, password, role: "student" });
    res.cookie("token", signToken(user._id), cookie_1.cookieOptions);
    res.status(201).json({ success: true, data: publicUser(user) });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, role } = req.body;
    const user = await User_1.default.findOne({ email }).select("+password");
    if (!user || user.role !== role || !(await user.comparePassword(password))) {
        throw new HttpError_1.HttpError(401, "Invalid credentials");
    }
    if (!user.isActive)
        throw new HttpError_1.HttpError(403, "Your account is deactivated");
    res.cookie("token", signToken(user._id), cookie_1.cookieOptions);
    res.json({ success: true, data: publicUser(user) });
});
const logout = (_req, res) => {
    res.clearCookie("token", { ...cookie_1.cookieOptions, maxAge: undefined });
    res.json({ success: true, message: "Logged out" });
};
exports.logout = logout;
const me = (req, res) => res.json({ success: true, data: publicUser(req.user) });
exports.me = me;
//# sourceMappingURL=auth.controller.js.map