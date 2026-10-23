import { Request, Response } from "express";
export declare const register: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const login: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const logout: (_req: Request, res: Response) => void;
export declare const me: (req: Request, res: Response) => Response<any, Record<string, any>>;
//# sourceMappingURL=auth.controller.d.ts.map