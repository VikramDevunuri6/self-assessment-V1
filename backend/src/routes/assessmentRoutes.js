const express = require("express");
const { z } = require("zod");
const router = express.Router();

const assessmentController = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { ROLES } = require("../constants/roles");

const submitSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
  }),
});

router.get("/latest", authMiddleware, requireRole(ROLES.STUDENT), assessmentController.getLatest);
router.post("/start", authMiddleware, requireRole(ROLES.STUDENT), assessmentController.start);
router.post(
  "/submit",
  authMiddleware,
  requireRole(ROLES.STUDENT),
  validate(submitSchema),
  assessmentController.submit
);

module.exports = router;
