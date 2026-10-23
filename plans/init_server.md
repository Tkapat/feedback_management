## Shared server code

// server/package.json (scripts)
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "tsx src/seed/seed.ts"
  }
}
bash
cd server
npm i express mongoose dotenv cors helmet jsonwebtoken bcryptjs cookie-parser express-rate-limit zod
npm i -D typescript tsx @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken
# if your bcryptjs version has no bundled types: npm i -D @types/bcryptjs
ts
// server/src/config/env.ts
import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"] as const;
required.forEach((k) => { if (!process.env[k]) throw new Error(`Missing env variable: ${k}`); });

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL!,
  isProd: process.env.NODE_ENV === "production",
};
ts
// server/src/config/cookie.ts
import { CookieOptions } from "express";
import { env } from "./env";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax", // cross-domain in production (Vercel ↔ Render)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
ts
// server/src/config/db.ts
import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("MongoDB connection failed:", (err as Error).message);
    process.exit(1);
  }
};
ts
// server/src/server.ts
import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

connectDB().then(() => app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`)));
ts
// server/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();
app.set("trust proxy", 1); // behind Render/Railway proxy
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
export default app;
ts
// server/src/routes.ts
import { Router } from "express";
import auth from "./modules/auth/auth.routes";
import lookup from "./modules/lookup/lookup.routes";
import student from "./modules/student/student.routes";
import admin from "./modules/admin/admin.routes";

const router = Router();
router.use("/auth", auth);
router.use("/", lookup);            // /departments /subjects /faculty /settings
router.use("/feedback", student);   // student feedback
router.use("/admin", admin);
export default router;
ts
// server/src/types/express.d.ts
import { HydratedDocument } from "mongoose";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request { user?: HydratedDocument<IUser> }
  }
}
export {};
ts
// server/src/utils/asyncHandler.ts
import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };
ts
// server/src/utils/HttpError.ts
export class HttpError extends Error {
  constructor(public status: number, message: string, public errors?: unknown) { super(message); }
}
ts
// server/src/utils/pagination.ts
export const getPagination = (q: { page?: unknown; limit?: unknown }) => {
  const page = Math.max(parseInt(String(q.page)) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(q.limit)) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
ts
// server/src/middleware/auth.ts
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
ts
// server/src/middleware/validate.ts
import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";
import { HttpError } from "../utils/HttpError";

export const validate = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return next(new HttpError(400, "Validation failed", errors));
  }
  req.body = result.data;
  next();
};
ts
// server/src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  message: { success: false, message: "Too many attempts, try again later" },
});

export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 30,
  message: { success: false, message: "Too many submissions, try again later" },
});
ts
// server/src/middleware/errorHandler.ts
import { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/HttpError";

export const notFound: RequestHandler = (_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = err instanceof HttpError ? err.status : 500;
  let message = err.message || "Server error";

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") { status = 401; message = "Session expired, please login again"; }
  if (err.code === 11000) { status = 409; message = "Duplicate entry: this record already exists"; }
  if (err.name === "CastError") { status = 400; message = "Invalid ID"; }
  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message, errors: err.errors });
};
ts
// server/src/seed/seed.ts  (outline: agent should expand it)
import "dotenv/config";
import mongoose from "mongoose";
// import all six models

// 1. connect, then deleteMany on all six collections
// 2. create the Setting singleton
// 3. 4 departments (COMP, IT, EXTC, MECH)
// 4. 3 faculty per department (12 total)
// 5. 1 subject per faculty, with semester 1-8
// 6. admin user from ADMIN_EMAIL / ADMIN_PASSWORD (role: "admin")
// 7. 20 students, first one student@college.edu / Student@123
// 8. ~120 teaching feedback rows, random type/rating/status/dates in the last 150 days,
//    ~40% anonymous, ratings 4-5 for appreciation and 1-3 for complaint,
//    skipping duplicate student+subject pairs (unique index)
// 9. log credentials, mongoose.disconnect()