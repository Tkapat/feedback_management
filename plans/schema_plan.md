## Schema for MongoDB (Mongoose + TypeScript)


text
Relationships
Department 1──* Faculty
Department 1──* Subject
Faculty    1──* Subject
Department 1──* User (students)
User       1──* Feedback
Feedback   *──1 Department / Subject / Faculty
Feedback   1──* replies (embedded)
Setting    singleton document




// server/src/models/User.ts

import { Schema, model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  rollNo?: string;
  department?: Types.ObjectId;
  isActive: boolean;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    rollNo: { type: String, trim: true, uppercase: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ rollNo: 1 }, { unique: true, partialFilterExpression: { rollNo: { $type: "string" } } });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default model<IUser>("User", userSchema);
ts
// server/src/models/Department.ts
import { Schema, model } from "mongoose";

export interface IDepartment { name: string; code: string; isActive: boolean }

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IDepartment>("Department", departmentSchema);
ts
// server/src/models/Faculty.ts
import { Schema, model, Types } from "mongoose";

export interface IFaculty {
  name: string; email?: string; designation: string; department: Types.ObjectId; isActive: boolean;
}

const facultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    designation: { type: String, trim: true, default: "Assistant Professor" },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
facultySchema.index({ department: 1, isActive: 1 });

export default model<IFaculty>("Faculty", facultySchema);
ts
// server/src/models/Subject.ts
import { Schema, model, Types } from "mongoose";

export interface ISubject {
  name: string; code: string; semester: number;
  department: Types.ObjectId; faculty: Types.ObjectId; isActive: boolean;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    semester: { type: Number, min: 1, max: 8, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
subjectSchema.index({ department: 1, isActive: 1 });

export default model<ISubject>("Subject", subjectSchema);
ts
// server/src/models/Feedback.ts
import { Schema, model, Types } from "mongoose";

export interface IReply { admin: Types.ObjectId; message: string; createdAt: Date }

export interface IFeedback {
  student: Types.ObjectId;
  department: Types.ObjectId;
  subject?: Types.ObjectId;
  faculty?: Types.ObjectId;
  category: "teaching" | "classroom" | "laboratory" | "other";
  type: "appreciation" | "complaint" | "suggestion";
  rating?: number;
  tags: string[];
  comment: string;
  isAnonymous: boolean;
  status: "pending" | "in_review" | "resolved" | "rejected";
  priority: boolean;
  replies: IReply[];
  cycle: string;
}

const replySchema = new Schema<IReply>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const feedbackSchema = new Schema<IFeedback>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
    category: { type: String, enum: ["teaching", "classroom", "laboratory", "other"], required: true },
    type: { type: String, enum: ["appreciation", "complaint", "suggestion"], required: true },
    rating: { type: Number, min: 1, max: 5 },
    tags: [{ type: String, trim: true }],
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "in_review", "resolved", "rejected"], default: "pending" },
    priority: { type: Boolean, default: false },
    replies: [replySchema],
    cycle: { type: String, required: true }, // e.g. "2026-ODD"
  },
  { timestamps: true }
);

// Teaching feedback must carry subject, faculty and rating
feedbackSchema.pre("validate", function (next) {
  if (this.category === "teaching" && (!this.subject || !this.faculty || !this.rating)) {
    return next(new Error("Teaching feedback requires subject, faculty and rating"));
  }
  next();
});

// One teaching feedback per student + faculty + subject + cycle
feedbackSchema.index(
  { student: 1, faculty: 1, subject: 1, cycle: 1 },
  { unique: true, partialFilterExpression: { category: "teaching" } }
);
feedbackSchema.index({ faculty: 1, type: 1 });
feedbackSchema.index({ department: 1, type: 1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });
feedbackSchema.index({ comment: "text" });

export default model<IFeedback>("Feedback", feedbackSchema);
ts
// server/src/models/Setting.ts   (singleton: key = "main")
import { Schema, model } from "mongoose";

export interface ISetting {
  key: string; feedbackOpen: boolean; startDate?: Date; endDate?: Date;
  currentCycle: string; tags: string[];
}

const settingSchema = new Schema<ISetting>(
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

export default model<ISetting>("Setting", settingSchema);