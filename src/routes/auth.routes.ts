import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.register
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// Refresh access token
router.post("/refresh", authController.refreshToken);

// Logout user
router.post("/logout", authController.logout);

// Get current user profile (protected route)
router.get("/me", authenticate, authController.me);

export default router;
