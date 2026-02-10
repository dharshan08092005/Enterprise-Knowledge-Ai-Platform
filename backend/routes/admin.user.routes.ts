import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
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
  requireRole("ADMIN"),
  getAllUsers
);

/**
 * ADMIN — Get only auditors (optional but useful)
 */
router.get(
  "/users/auditors",
  authMiddleware,
  requireRole("ADMIN"),
  getAuditors
);

export default router;
