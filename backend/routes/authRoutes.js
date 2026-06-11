const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");

router.post(
  "/signup",
  validateBody([
    "fullName",
    "phoneNumber",
    "email",
    "rollNumber",
    "branch",
    "passingYear",
    "password",
  ]),
  authController.signup
);

router.post(
  "/login",
  validateBody(["email", "password"]),
  authController.login
);

router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
