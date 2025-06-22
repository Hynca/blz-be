import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { JwtPayload } from "../types";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRATION = Number(process.env.JWT_EXPIRATION) || 15 * 60;
const REFRESH_TOKEN_EXPIRATION =
  Number(process.env.REFRESH_TOKEN_EXPIRATION) || 7 * 24 * 60 * 60;

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
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: JWT_EXPIRATION * 1000,
    path: "/",
  });
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
): void => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRATION * 1000,
    path: "/",
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
  res.cookie("refreshToken", "", {
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

export const getRefreshTokenFromCookie = (req: Request): string | null => {
  return req.cookies && req.cookies.refreshToken
    ? req.cookies.refreshToken
    : null;
};
