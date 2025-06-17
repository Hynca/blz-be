import { Request, Response } from "express";
import { validationResult } from "express-validator";
import db from "../models";
import * as jwtUtils from "../utils/jwt.utils";
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

    // Generate refresh token
    const refreshToken = jwtUtils.generateRefreshToken();

    // Save refresh token to user record
    await user.update({ refreshToken });

    // Set HTTP-only cookies
    jwtUtils.setCookie(res, token);
    jwtUtils.setRefreshTokenCookie(res, refreshToken);

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

    // Check password through the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    // Generate JWT token
    const token = jwtUtils.generateToken(user.id, user.email, user.username);

    // Generate refresh token
    const refreshToken = jwtUtils.generateRefreshToken();

    // Save refresh token to user record
    await user.update({ refreshToken });

    // Set HTTP-only cookies
    jwtUtils.setCookie(res, token);
    jwtUtils.setRefreshTokenCookie(res, refreshToken);

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

// Refresh the user's access token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get the refresh token from the cookie
    const refreshToken = jwtUtils.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not provided" });
      return;
    }

    // Find the user with this refresh token
    const user = await User.findOne({ where: { refreshToken } });

    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Generate a new access token
    const newAccessToken = jwtUtils.generateToken(
      user.id,
      user.email,
      user.username
    );

    // Generate a new refresh token (optional, for enhanced security)
    const newRefreshToken = jwtUtils.generateRefreshToken();

    // Update the user with the new refresh token
    await user.update({ refreshToken: newRefreshToken });

    // Set the new tokens as cookies
    jwtUtils.setCookie(res, newAccessToken);
    jwtUtils.setRefreshTokenCookie(res, newRefreshToken);

    // Return success message
    res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while refreshing token",
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the refresh token from the cookie
    const refreshToken = jwtUtils.getRefreshTokenFromCookie(req);

    // If refresh token exists, find and update the user
    if (refreshToken) {
      const user = await User.findOne({ where: { refreshToken } });
      if (user) {
        // Clear the refresh token in the database
        await user.update({ refreshToken: null });
      }
    }

    // Clear the JWT cookies
    jwtUtils.clearCookie(res);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred during logout",
    });
  }
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
      attributes: { exclude: ["password", "refreshToken"] },
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
