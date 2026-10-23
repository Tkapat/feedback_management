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