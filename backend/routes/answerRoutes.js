const express = require("express");
const router = express.Router();

const answerController = require("../controllers/answerController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");

router.post(
  "/",
  authMiddleware,
  validateBody(["userId", "answers"]),
  answerController.submitAnswers
);

module.exports = router;
