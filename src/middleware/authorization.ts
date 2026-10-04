import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/tokenize";

// Kept as a type alias for any code that imports it
export type AuthenticatedRequest = Request;

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Authorization token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = await decodeToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "User is not authenticated",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};
