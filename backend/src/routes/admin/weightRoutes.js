const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const updateWeightSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ weight: z.coerce.number() }),
});

router.get("/", configController.listWeights);
router.put(
  "/:id",
  validate(updateWeightSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("update_trait_dimension_weight", "trait_dimension_weight"),
  configController.updateWeight
);

module.exports = router;
