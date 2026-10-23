"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const HttpError_1 = require("../utils/HttpError");
const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
        return next(new HttpError_1.HttpError(400, "Validation failed", errors));
    }
    req.body = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map