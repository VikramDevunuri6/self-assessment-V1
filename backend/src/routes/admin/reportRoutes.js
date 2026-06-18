const express = require("express");
const { z } = require("zod");
const router = express.Router();

const reportController = require("../../controllers/admin/reportController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const sessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

const regenerateSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

router.get("/", reportController.listReports);
router.get("/:sessionId", validate(sessionParamsSchema), reportController.getReport);
router.get("/:sessionId/answers", validate(sessionParamsSchema), reportController.getAnswerSheet);
router.get("/:sessionId/breakdown", validate(sessionParamsSchema), reportController.getBreakdown);
router.post(
  "/regenerate",
  validate(regenerateSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("regenerate_report", "assessment_result"),
  reportController.regenerateReport
);

module.exports = router;
