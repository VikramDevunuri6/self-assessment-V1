const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const createCategorySchema = z.object({
  body: z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

router.get("/", configController.listCategories);
router.post(
  "/",
  validate(createCategorySchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("create_category", "category"),
  configController.createCategory
);

module.exports = router;
