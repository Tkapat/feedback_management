// server/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    rollNo: { type: String, trim: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// rollNo unique only for students that have one
userSchema.index(
  { rollNo: 1 },
  { unique: true, partialFilterExpression: { rollNo: { $type: "string" } } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
js
// server/src/models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
js
// server/src/models/Faculty.js
const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    designation: { type: String, trim: true, default: "Assistant Professor" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

facultySchema.index({ department: 1, isActive: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
js
// server/src/models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    semester: { type: Number, min: 1, max: 8, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ department: 1, isActive: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
js
// server/src/models/Feedback.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const replySchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const feedbackSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },

    category: {
      type: String,
      enum: ["teaching", "classroom", "laboratory", "other"],
      required: true,
    },
    type: {
      type: String,
      enum: ["appreciation", "complaint", "suggestion"],
      required: true,
    },
    rating: { type: Number, min: 1, max: 5 },
    tags: [{ type: String, trim: true }],
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "rejected"],
      default: "pending",
    },
    priority: { type: Boolean, default: false },
    replies: [replySchema],
    cycle: { type: String, required: true }, // e.g. "2026-ODD"
  },
  { timestamps: true }
);

// Teaching feedback must have subject, faculty and rating
feedbackSchema.pre("validate", function (next) {
  if (this.category === "teaching") {
    if (!this.subject || !this.faculty || !this.rating) {
      return next(new Error("Teaching feedback requires subject, faculty and rating"));
    }
  }
  next();
});

// One teaching feedback per student + faculty + subject + cycle
feedbackSchema.index(
  { student: 1, faculty: 1, subject: 1, cycle: 1 },
  { unique: true, partialFilterExpression: { category: "teaching" } }
);

// Indexes for filters and stats
feedbackSchema.index({ faculty: 1, type: 1 });
feedbackSchema.index({ department: 1, type: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });
feedbackSchema.index({ comment: "text" });

module.exports = mongoose.model("Feedback", feedbackSchema);
js
// server/src/models/Setting.js  (singleton document)
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    feedbackOpen: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    currentCycle: { type: String, default: "2026-ODD" },
    tags: {
      type: [String],
      default: ["Late Lectures", "Poor Internet", "Dirty Labs", "Too Fast", "No Practicals", "Great Teaching"],
    },
  },
  { timestamps: true }
);

settingSchema.statics.getSingleton = async function () {
  return (await this.findOne({ key: "main" })) || (await this.create({ key: "main" }));
};

module.exports = mongoose.model("Setting", settingSchema);

Collection relationships

Department 1───* Faculty
Department 1───* Subject
Faculty    1───* Subject
Department 1───* User(student)
User(student) 1───* Feedback
Feedback *───1 Department / Subject / Faculty
Feedback 1───* replies (embedded)
Setting: single document