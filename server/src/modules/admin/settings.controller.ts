import { asyncHandler } from "../../utils/asyncHandler";
import { getSettings } from "../../utils/settings";

export const update = asyncHandler(async (req, res) => {
  const s = await getSettings();
  Object.assign(s, req.body);
  await s.save();
  res.json({ success: true, data: s });
});