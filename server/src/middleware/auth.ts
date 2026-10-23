import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { env } from "../config/env";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new HttpError(401, "Not authenticated");

  const { id } = jwt.verify(token, env.JWT_SECRET) as { id: string };
  const user = await User.findById(id);
  if (!user || !user.isActive) throw new HttpError(401, "Account not available");

  req.user = user;
  next();
});

export const authorize =
  (...roles: Array<"student" | "admin">): RequestHandler =>
  (req, _res, next) =>
    req.user && roles.includes(req.user.role) ? next() : next(new HttpError(403, "Access denied"));