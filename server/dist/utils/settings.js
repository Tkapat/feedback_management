"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWindowOpen = exports.getSettings = void 0;
const Setting_1 = __importDefault(require("../models/Setting"));
const getSettings = async () => (await Setting_1.default.findOne({ key: "main" })) ?? (await Setting_1.default.create({ key: "main" }));
exports.getSettings = getSettings;
const isWindowOpen = (s) => {
    if (!s.feedbackOpen)
        return false;
    const now = new Date();
    if (s.startDate && now < s.startDate)
        return false;
    if (s.endDate && now > s.endDate)
        return false;
    return true;
};
exports.isWindowOpen = isWindowOpen;
//# sourceMappingURL=settings.js.map