import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  getAllUsers,
  getAuditors,
  createUser,
  updateUserDepartment
} from "../controllers/adminUser.controller";

const router = Router();

/**
 * ADMIN — Get all users (read-only)
 */
router.get(
  "/users",
  authMiddleware,
  requireRole("ORG_ADMIN"),
  getAllUsers
);

/**
 * ADMIN — Get only auditors (optional but useful)
 */
router.get(
  "/users/auditors",
  authMiddleware,
  requireRole("ORG_ADMIN"),
  getAuditors
);

/**
 * ORG_ADMIN — Create new user
 */
router.post(
  "/users",
  authMiddleware,
  requireRole("ORG_ADMIN"),
  createUser
);

/**
 * ORG_ADMIN — Change user department
 */
router.put(
  "/users/:id/department",
  authMiddleware,
  requireRole("ORG_ADMIN"),
  updateUserDepartment
);

export default router;
