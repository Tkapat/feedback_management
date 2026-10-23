"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = void 0;
const getPagination = (q) => {
    const page = Math.max(parseInt(String(q.page)) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(q.limit)) || 10, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};
exports.getPagination = getPagination;
//# sourceMappingURL=pagination.js.map