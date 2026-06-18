const express = require("express");
const { z } = require("zod");
const router = express.Router();

const answerController = require("../controllers/answerController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { ROLES } = require("../constants/roles");

const saveAnswerSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
    questionId: z.coerce.number().int().positive(),
    optionId: z.coerce.number().int().positive(),
  }),
});

router.put(
  "/",
  authMiddleware,
  requireRole(ROLES.STUDENT),
  validate(saveAnswerSchema),
  answerController.saveAnswer
);

module.exports = router;
