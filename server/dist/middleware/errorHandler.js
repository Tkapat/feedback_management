"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const HttpError_1 = require("../utils/HttpError");
const notFound = (_req, res) => res.status(404).json({ success: false, message: "Route not found" });
exports.notFound = notFound;
const errorHandler = (err, _req, res, _next) => {
    let status = err instanceof HttpError_1.HttpError ? err.status : 500;
    let message = err.message || "Server error";
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        status = 401;
        message = "Session expired, please login again";
    }
    if (err.code === 11000) {
        status = 409;
        message = "Duplicate entry: this record already exists";
    }
    if (err.name === "CastError") {
        status = 400;
        message = "Invalid ID";
    }
    if (status === 500)
        console.error(err);
    res.status(status).json({ success: false, message, errors: err.errors });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map