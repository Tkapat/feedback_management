"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const admin_schema_1 = require("./admin.schema");
const fb = __importStar(require("./feedback.controller"));
const stats = __importStar(require("./stats.controller"));
const master = __importStar(require("./masterData.controller"));
const students = __importStar(require("./students.controller"));
const settings = __importStar(require("./settings.controller"));
const router = (0, express_1.Router)();
router.use(auth_1.protect, (0, auth_1.authorize)("admin"));
// Feedback
router.get("/feedback", fb.list);
router.get("/feedback/export", fb.exportCsv);
router.get("/feedback/:id", fb.getOne);
router.patch("/feedback/:id/status", (0, validate_1.validate)(admin_schema_1.statusSchema), fb.updateStatus);
router.patch("/feedback/:id/priority", fb.togglePriority);
router.post("/feedback/:id/reply", (0, validate_1.validate)(admin_schema_1.replySchema), fb.reply);
// Stats
router.get("/stats/overview", stats.overview);
router.get("/stats/faculty", stats.faculty);
router.get("/stats/subjects", stats.subjects);
router.get("/stats/departments", stats.departments);
router.get("/stats/top", stats.top);
router.get("/stats/concerns", stats.concerns);
// Master data
["departments", "faculty", "subjects"].forEach((name) => {
    router.get(`/${name}`, master[name].list);
    router.post(`/${name}`, master[name].create);
    router.put(`/${name}/:id`, master[name].update);
    router.delete(`/${name}/:id`, master[name].remove);
});
// Students + settings
router.get("/students", students.list);
router.patch("/students/:id/active", students.toggleActive);
router.put("/settings", (0, validate_1.validate)(admin_schema_1.settingsSchema), settings.update);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map