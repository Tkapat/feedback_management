"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const settings_1 = require("../../utils/settings");
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const s = await (0, settings_1.getSettings)();
    Object.assign(s, req.body);
    await s.save();
    res.json({ success: true, data: s });
});
//# sourceMappingURL=settings.controller.js.map