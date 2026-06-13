const express = require("express");
const { z } = require("zod");
const router = express.Router();

const resultController = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

const sessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

router.get("/:sessionId", authMiddleware, validate(sessionParamsSchema), resultController.getResult);
router.get("/:sessionId/pdf", authMiddleware, validate(sessionParamsSchema), resultController.getResultPdf);

module.exports = router;
