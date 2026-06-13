const express = require("express");
const { z } = require("zod");
const router = express.Router();

const configController = require("../../controllers/admin/configController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const RECOMMENDATION_TYPES = ["career", "learning", "interview_focus", "strength", "weakness"];

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
    type: z.enum(RECOMMENDATION_TYPES).optional(),
  }),
});

const createRecommendationSchema = z.object({
  body: z.object({
    type: z.enum(RECOMMENDATION_TYPES),
    traitId: z.coerce.number().int().positive().optional(),
    dimensionId: z.coerce.number().int().positive().optional(),
    personalityTypeId: z.coerce.number().int().positive().optional(),
    condition: z.record(z.string(), z.unknown()).optional(),
    title: z.string().min(1),
    content: z.string().min(1),
    priority: z.coerce.number().int().optional(),
  }),
});

const updateRecommendationSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    type: z.enum(RECOMMENDATION_TYPES).optional(),
    traitId: z.coerce.number().int().positive().nullable().optional(),
    dimensionId: z.coerce.number().int().positive().nullable().optional(),
    personalityTypeId: z.coerce.number().int().positive().nullable().optional(),
    condition: z.record(z.string(), z.unknown()).optional(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

router.get("/", validate(listQuerySchema), configController.listRecommendations);
router.post(
  "/",
  validate(createRecommendationSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("create_recommendation", "recommendation"),
  configController.createRecommendation
);
router.put(
  "/:id",
  validate(updateRecommendationSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("update_recommendation", "recommendation"),
  configController.updateRecommendation
);
router.delete(
  "/:id",
  validate(idParamSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("delete_recommendation", "recommendation"),
  configController.deleteRecommendation
);

module.exports = router;
