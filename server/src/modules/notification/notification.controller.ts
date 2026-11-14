import { Types } from "mongoose";
import Notification from "../../models/Notification";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/HttpError";

export const listMyNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ student: new Types.ObjectId(String(req.user!._id)) })
    .sort({ read: 1, createdAt: -1 })
    .lean();
  res.json({ success: true, data: items });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, student: req.user!._id },
    { read: true },
    { new: true },
  );
  if (!item) throw new HttpError(404, "Notification not found");
  res.json({ success: true, data: item });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ student: req.user!._id, read: false }, { read: true });
  res.json({ success: true, message: "All notifications marked as read" });
});
