"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    rollNo: { type: String, trim: true, uppercase: true },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
userSchema.index({ rollNo: 1 }, { unique: true, partialFilterExpression: { rollNo: { $type: "string" } } });
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (plain) {
    return bcryptjs_1.default.compare(plain, this.password);
};
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.js.map