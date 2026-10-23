"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const facultySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    designation: { type: String, trim: true, default: "Assistant Professor" },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department", required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
facultySchema.index({ department: 1, isActive: 1 });
exports.default = (0, mongoose_1.model)("Faculty", facultySchema);
//# sourceMappingURL=Faculty.js.map