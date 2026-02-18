import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roleName: string;
    permissions: string[];
    organizationId: string;
    departmentId?: string;
  };
}


export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Check header format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // 3️⃣ Validate expected payload
    if (!decoded.userId || !decoded.roleName) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 4️⃣ Attach safe user object
    req.user = {
      userId: decoded.userId,
      roleName: decoded.roleName,
      permissions: decoded.permissions,
      organizationId: decoded.organizationId,
      departmentId: decoded.departmentId
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
