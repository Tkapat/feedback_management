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