const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const createTypeSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    criteria: z.record(z.string(), z.unknown()).optional(),
    priority: z.coerce.number().int().optional(),
  }),
});

const updateTypeSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    criteria: z.record(z.string(), z.unknown()).optional(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

router.get("/", configController.listPersonalityTypes);
router.post(
  "/",
  validate(createTypeSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("create_personality_type", "personality_type"),
  configController.createPersonalityType
);
router.put(
  "/:id",
  validate(updateTypeSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("update_personality_type", "personality_type"),
  configController.updatePersonalityType
);

module.exports = router;
