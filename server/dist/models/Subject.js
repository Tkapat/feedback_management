"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    semester: { type: Number, min: 1, max: 8, required: true },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department", required: true },
    faculty: { type: mongoose_1.Schema.Types.ObjectId, ref: "Faculty", required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
subjectSchema.index({ department: 1, isActive: 1 });
exports.default = (0, mongoose_1.model)("Subject", subjectSchema);
//# sourceMappingURL=Subject.js.map