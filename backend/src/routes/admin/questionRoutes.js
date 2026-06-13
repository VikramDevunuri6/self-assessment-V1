const express = require("express");
const { z } = require("zod");
const router = express.Router();

const questionController = require("../../controllers/admin/questionController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const requirePermission = require("../../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../../constants/permissions");

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const optionSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  optionText: z.string().min(1).optional(),
  optionOrder: z.coerce.number().int().positive().optional(),
  score: z.coerce.number().optional(),
});

const createQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(1),
    questionType: z.string().min(1),
    imageUrl: z.string().url().optional().nullable(),
    categoryId: z.coerce.number().int().positive().optional(),
    traitId: z.coerce.number().int().positive().optional(),
    options: z.array(optionSchema).optional(),
  }),
});

const updateQuestionSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    questionText: z.string().min(1).optional(),
    questionType: z.string().min(1).optional(),
    imageUrl: z.string().url().optional().nullable(),
    categoryId: z.coerce.number().int().positive().optional(),
    traitId: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    options: z.array(optionSchema).optional(),
  }),
});

router.get("/", questionController.listQuestions);
router.get("/:id", validate(idParamSchema), questionController.getQuestion);
router.post(
  "/",
  validate(createQuestionSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("create_question", "question"),
  questionController.createQuestion
);
router.put(
  "/:id",
  validate(updateQuestionSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("update_question", "question"),
  questionController.updateQuestion
);
router.delete(
  "/:id",
  validate(idParamSchema),
  requirePermission(PERMISSIONS.MANAGE_ASSESSMENTS),
  auditLog("delete_question", "question"),
  questionController.deleteQuestion
);

module.exports = router;
