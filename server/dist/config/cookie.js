"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
const env_1 = require("./env");
exports.cookieOptions = {
    httpOnly: true,
    secure: env_1.env.isProd,
    sameSite: env_1.env.isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
//# sourceMappingURL=cookie.js.map