const express = require("express");
const { z } = require("zod");
const router = express.Router();

const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { ROLES } = require("../constants/roles");

const sessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

router.get(
  "/:sessionId",
  authMiddleware,
  requireRole(ROLES.STUDENT),
  validate(sessionParamsSchema),
  questionController.getQuestionsForSession
);

module.exports = router;
