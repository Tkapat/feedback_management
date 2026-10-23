"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const replySchema = new mongoose_1.Schema({
    admin: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: { createdAt: true, updatedAt: false } });
const feedbackSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department", required: true },
    subject: { type: mongoose_1.Schema.Types.ObjectId, ref: "Subject" },
    faculty: { type: mongoose_1.Schema.Types.ObjectId, ref: "Faculty" },
    category: { type: String, enum: ["teaching", "classroom", "laboratory", "other"], required: true },
    type: { type: String, enum: ["appreciation", "complaint", "suggestion"], required: true },
    rating: { type: Number, min: 1, max: 5 },
    tags: [{ type: String, trim: true }],
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "in_review", "resolved", "rejected"], default: "pending" },
    priority: { type: Boolean, default: false },
    replies: [replySchema],
    cycle: { type: String, required: true },
}, { timestamps: true });
feedbackSchema.pre("validate", function (next) {
    if (this.category === "teaching" && (!this.subject || !this.faculty || !this.rating)) {
        return next(new Error("Teaching feedback requires subject, faculty and rating"));
    }
    next();
});
feedbackSchema.index({ student: 1, faculty: 1, subject: 1, cycle: 1 }, { unique: true, partialFilterExpression: { category: "teaching" } });
feedbackSchema.index({ faculty: 1, type: 1 });
feedbackSchema.index({ department: 1, type: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });
feedbackSchema.index({ comment: "text" });
exports.default = (0, mongoose_1.model)("Feedback", feedbackSchema);
//# sourceMappingURL=Feedback.js.map