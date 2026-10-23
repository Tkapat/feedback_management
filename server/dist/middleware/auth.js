"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const asyncHandler_1 = require("../utils/asyncHandler");
const HttpError_1 = require("../utils/HttpError");
const env_1 = require("../config/env");
exports.protect = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    const token = req.cookies?.token;
    if (!token)
        throw new HttpError_1.HttpError(401, "Not authenticated");
    const { id } = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    const user = await User_1.default.findById(id);
    if (!user || !user.isActive)
        throw new HttpError_1.HttpError(401, "Account not available");
    req.user = user;
    next();
});
const authorize = (...roles) => (req, _res, next) => req.user && roles.includes(req.user.role) ? next() : next(new HttpError_1.HttpError(403, "Access denied"));
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map