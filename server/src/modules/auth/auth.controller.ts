import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User, { IUser } from "../../models/User";
import Department from "../../models/Department";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";
import { env } from "../../config/env";
import { cookieOptions } from "../../config/cookie";

const signToken = (id: unknown) =>
  jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

const publicUser = (u: IUser & { _id: unknown }) => ({
  id: u._id, name: u.name, email: u.email, role: u.role, rollNo: u.rollNo, department: u.department,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, rollNo, department, password } = req.body;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(department);
  const dept = isObjectId
    ? await Department.findOne({ _id: department, isActive: true })
    : await Department.findOne({ code: department.toUpperCase(), isActive: true });
  if (!dept) throw new HttpError(400, "Invalid department");

  const user = await User.create({ name, email, rollNo, department: dept._id, password, role: "student" });
  res.cookie("token", signToken(user._id), cookieOptions);
  res.status(201).json({ success: true, data: publicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || user.role !== role || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid credentials");
  }
  if (!user.isActive) throw new HttpError(403, "Your account is deactivated");

  res.cookie("token", signToken(user._id), cookieOptions);
  res.json({ success: true, data: publicUser(user) });
});

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
}

export const me = (req: Request, res: Response) =>
  res.json({ success: true, data: publicUser(req.user!) });