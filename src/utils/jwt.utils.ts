import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JwtPayload } from "../types";

// Load JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "";
// Token expiration time (in seconds)
const JWT_EXPIRATION = Number(process.env.JWT_EXPIRATION) || 24 * 60 * 60; // 24 hours

export const generateToken = (
  userId: number,
  email: string,
  username: string
): string => {
  return jwt.sign({ userId, email, username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
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

export const clearCookie = (res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
};

export const getTokenFromCookie = (req: Request): string | null => {
  return req.cookies && req.cookies.token ? req.cookies.token : null;
};
