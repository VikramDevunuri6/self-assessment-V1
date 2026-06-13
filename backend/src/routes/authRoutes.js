const express = require("express");
const { z } = require("zod");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const signupSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1, "fullName is required"),
    phoneNumber: z.string().trim().min(1, "phoneNumber is required"),
    email: z.string().trim().email("A valid email is required"),
    rollNumber: z.string().trim().min(1, "rollNumber is required"),
    branch: z.string().trim().min(1, "branch is required"),
    passingYear: z.union([z.string(), z.number()]),
    password: z.string().min(6, "password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("A valid email is required"),
    password: z.string().min(1, "password is required"),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
});

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authMiddleware, validate(refreshSchema), authController.logout);
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
