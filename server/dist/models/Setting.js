"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const settingSchema = new mongoose_1.Schema({
    key: { type: String, default: "main", unique: true },
    feedbackOpen: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    currentCycle: { type: String, default: "2026-ODD" },
    tags: {
        type: [String],
        default: ["Late Lectures", "Poor Internet", "Dirty Labs", "Too Fast", "No Practicals", "Great Teaching"],
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Setting", settingSchema);
//# sourceMappingURL=Setting.js.map