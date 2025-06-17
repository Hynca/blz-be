import { Request, Response, NextFunction } from "express";
import * as jwtUtils from "../utils/jwt.utils";
import { JwtPayload } from "../types";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from cookie
    const token = jwtUtils.getTokenFromCookie(req);

    if (!token) {
      res.status(401).json({
        message: "Authentication required",
        code: "NO_TOKEN",
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwtUtils.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          message: "Invalid or expired token",
          code: "INVALID_TOKEN",
        });
        return;
      }

      // Attach user data to request
      req.user = decoded as JwtPayload;

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      // Check if token is expired
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          message: "Token has expired",
          code: "TOKEN_EXPIRED",
        });
      } else {
        res.status(401).json({
          message: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};

// Optional middleware that can be used to protect routes that need authentication
// but should automatically try to use the refresh token if the access token is expired
export const authenticateWithAutoRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This is a simplified version. In production, you'd want to avoid circular redirects
    // and implement proper error handling.

    // Get token from cookie
    const token = jwtUtils.getTokenFromCookie(req);

    if (!token) {
      res.status(401).json({
        message: "Authentication required",
        code: "NO_TOKEN",
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwtUtils.verifyToken(token);

      if (decoded) {
        // Token is valid, attach user data and proceed
        req.user = decoded as JwtPayload;
        next();
        return;
      }
    } catch (error) {
      // Token verification failed - we'll attempt to refresh below
    }

    // At this point, the token is invalid or expired, so redirect to refresh endpoint
    // Note: For a real implementation, you should use a proper HTTP client library
    // or implement the refresh logic directly here to avoid redirects
    res.status(401).json({
      message: "Token expired. Please refresh your token.",
      code: "TOKEN_EXPIRED_REFRESH_NEEDED",
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};

// Helper function to check if the authenticated user owns the resource
export const checkResourceOwnership = (userIdParam: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const resourceUserId = parseInt(req.params[userIdParam], 10);
      const authUserId = req.user?.userId;

      if (!authUserId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (isNaN(resourceUserId) || resourceUserId !== authUserId) {
        res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this resource",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({ message: "Access forbidden" });
    }
  };
};
