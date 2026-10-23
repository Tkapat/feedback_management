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