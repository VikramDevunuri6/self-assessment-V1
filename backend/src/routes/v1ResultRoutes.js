const express = require("express");
const { z } = require("zod");
const router = express.Router();

const v1ResultController = require("../controllers/v1ResultController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

const sessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

router.get("/:sessionId", authMiddleware, validate(sessionParamsSchema), v1ResultController.getResult);
router.get("/:sessionId/pdf", authMiddleware, validate(sessionParamsSchema), v1ResultController.getResultPdf);

module.exports = router;
