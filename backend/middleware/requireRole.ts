import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

/**
 * requireRole
 * -----------
 * Enforces role-based access control.
 * Usage: requireRole("ADMIN", "USER")
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // authMiddleware must run first
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions"
      });
    }

    next();
  };
};
