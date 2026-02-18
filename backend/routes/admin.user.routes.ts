import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
// import { requireRole } from "../middleware/requireRole";
import { requirePermission } from "../middleware/requirePermission";
import {
  getAllUsers,
  getAuditors
} from "../controllers/adminUser.controller";

const router = Router();

/**
 * ADMIN — Get all users (read-only)
 */
router.get(
  "/users",
  authMiddleware,
  requirePermission("MANAGE_USERS"),
  getAllUsers
);

/**
 * ADMIN — Get only auditors (optional but useful)
 */
router.get(
  "/users/auditors",
  authMiddleware,
  requirePermission("VIEW_LOGS"),
  getAuditors
);

export default router;
