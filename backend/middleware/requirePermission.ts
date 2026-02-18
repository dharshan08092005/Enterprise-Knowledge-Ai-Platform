import { AuthRequest } from "./auth";
import { Response, NextFunction } from "express";

export const requirePermission =
  (permission: string) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
