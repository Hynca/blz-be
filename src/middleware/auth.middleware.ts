import { Request, Response, NextFunction } from "express";
import * as jwtUtils from "../utils/jwt.utils";

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: jwtUtils.JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from cookie
    const token = jwtUtils.getTokenFromCookie(req);

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Verify token
    const decoded = jwtUtils.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Attach user data to request
    req.user = decoded;

    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
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
        res
          .status(403)
          .json({
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
