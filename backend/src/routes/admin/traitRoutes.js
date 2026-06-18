const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const createTraitSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

const updateTraitSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

router.get("/", configController.listTraits);
router.post(
  "/",
  validate(createTraitSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("create_trait", "trait"),
  configController.createTrait
);
router.put(
  "/:id",
  validate(updateTraitSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("update_trait", "trait"),
  configController.updateTrait
);

module.exports = router;
