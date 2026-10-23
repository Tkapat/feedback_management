import Setting, { ISetting } from "../models/Setting";

export const getSettings = async () =>
  (await Setting.findOne({ key: "main" })) ?? (await Setting.create({ key: "main" }));

export const isWindowOpen = (s: ISetting) => {
  if (!s.feedbackOpen) return false;
  const now = new Date();
  if (s.startDate && now < s.startDate) return false;
  if (s.endDate && now > s.endDate) return false;
  return true;
};