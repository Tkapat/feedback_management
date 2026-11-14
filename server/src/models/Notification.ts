import { Schema, model, Types } from "mongoose";

export interface INotification {
  student: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ student: 1, read: 1, createdAt: -1 });

export default model<INotification>("Notification", notificationSchema);
