import { RequestHandler } from "express";
export declare const protect: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const authorize: (...roles: Array<"student" | "admin">) => RequestHandler;
//# sourceMappingURL=auth.d.ts.map