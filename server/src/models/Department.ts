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