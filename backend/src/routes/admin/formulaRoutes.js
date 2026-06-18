const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");
const { SUPPORTED_TYPES } = require("../../formulaEngine");

const publishVersionSchema = z.object({
  params: z.object({ code: z.string().min(1) }),
  body: z.object({
    definition: z
      .object({ type: z.enum(SUPPORTED_TYPES) })
      .passthrough(),
  }),
});

router.get("/", configController.listFormulas);
router.post(
  "/:code/versions",
  validate(publishVersionSchema),
  requirePermission(PERMISSIONS.MANAGE_FORMULAS),
  auditLog("publish_formula_version", "formula"),
  configController.publishFormulaVersion
);

module.exports = router;
