import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JwtPayload } from "../types";
import crypto from "crypto";

// Load JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "";
// Token expiration time (in seconds)
const JWT_EXPIRATION = Number(process.env.JWT_EXPIRATION) || 15 * 60; // 15 minutes for access token
// Refresh token expiration (in seconds)
const REFRESH_TOKEN_EXPIRATION =
  Number(process.env.REFRESH_TOKEN_EXPIRATION) || 7 * 24 * 60 * 60; // 7 days

export const generateToken = (
  userId: number,
  email: string,
  username: string
): string => {
  return jwt.sign({ userId, email, username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

export const generateRefreshToken = (): string => {
  // Generate a secure random string for refresh token
  return crypto.randomBytes(40).toString("hex");
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const setCookie = (res: Response, token: string): void => {
  // Set the token as an HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: JWT_EXPIRATION * 1000, // Convert to milliseconds
    path: "/", // Cookie is available for all routes
  });
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
): void => {
  // Set the refresh token as an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRATION * 1000,
    path: "/api/auth/refresh", // Only accessible for refresh endpoint
  });
};

export const clearCookie = (res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  // Also clear refresh token
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/api/auth/refresh",
  });
};

export const getTokenFromCookie = (req: Request): string | null => {
  return req.cookies && req.cookies.token ? req.cookies.token : null;
};

export const getRefreshTokenFromCookie = (req: Request): string | null => {
  return req.cookies && req.cookies.refreshToken
    ? req.cookies.refreshToken
    : null;
};
