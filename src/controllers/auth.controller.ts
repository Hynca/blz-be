import { Request, Response } from "express";
import { validationResult } from "express-validator";
import db from "../models";
import * as jwtUtils from "../utils/jwt.utils";
import bcrypt from "bcrypt";

const User = db.users;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }
    const user = await User.create({
      username,
      email,
      password,
    });

    const token = jwtUtils.generateToken(user.id, user.email, user.username);

    const refreshToken = jwtUtils.generateRefreshToken();

    await user.update({ refreshToken });

    jwtUtils.setCookie(res, token);
    jwtUtils.setRefreshTokenCookie(res, refreshToken);
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
      refreshToken,
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwtUtils.generateToken(user.id, user.email, user.username);

    const refreshToken = jwtUtils.generateRefreshToken();

    await user.update({ refreshToken });

    jwtUtils.setCookie(res, token);
    jwtUtils.setRefreshTokenCookie(res, refreshToken);

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while logging in",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = jwtUtils.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not provided" });
      return;
    }

    const user = await User.findOne({ where: { refreshToken } });

    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = jwtUtils.generateToken(
      user.id,
      user.email,
      user.username
    );

    const newRefreshToken = jwtUtils.generateRefreshToken();

    await user.update({ refreshToken: newRefreshToken });

    jwtUtils.setCookie(res, newAccessToken);
    jwtUtils.setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred while refreshing token",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = jwtUtils.getRefreshTokenFromCookie(req);

    if (refreshToken) {
      const user = await User.findOne({ where: { refreshToken } });
      if (user) {
        await user.update({ refreshToken: null });
      }
    }

    jwtUtils.clearCookie(res);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Error occurred during logout",
    });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
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
