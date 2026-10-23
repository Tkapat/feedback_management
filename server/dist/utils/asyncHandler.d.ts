import { NextFunction, Request, RequestHandler, Response } from "express";
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map