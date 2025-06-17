import { Request, Response } from "express";
import { validationResult } from "express-validator";
import db from "../models";
import * as jwtUtils from "../utils/jwt.utils";
import { testBcrypt } from "../utils/password-test.utils";
import bcrypt from "bcrypt";

const User = db.users;

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    } // Create user
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed by the model hooks
    });

    // Generate JWT token
    const token = jwtUtils.generateToken(user.id, user.email, user.username);

    // Set HTTP-only cookie
    jwtUtils.setCookie(res, token);

    // Return user info (without password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while registering the user",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Try direct bcrypt comparison as a test
    try {
      const directCompare = await bcrypt.compare(password, user.password);
      console.log("Direct compare result:", directCompare);
    } catch (err) {
      console.error("Direct bcrypt comparison error:", err);
    }

    // Check password through the model method
    console.log("Attempting to compare password through model method");
    const isPasswordValid = await user.comparePassword(password);
    console.log("Model method password valid:", isPasswordValid);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    // Generate JWT token
    const token = jwtUtils.generateToken(user.id, user.email, user.username);

    // Set HTTP-only cookie
    jwtUtils.setCookie(res, token);

    // Return user info (without password)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while logging in",
    });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  // Clear the JWT cookie
  jwtUtils.clearCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
};

// Get current user profile
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // User ID is available from auth middleware
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while fetching user profile",
    });
  }
};
