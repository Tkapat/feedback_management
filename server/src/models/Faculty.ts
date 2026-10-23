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