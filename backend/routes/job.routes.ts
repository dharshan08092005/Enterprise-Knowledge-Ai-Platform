import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import {
  getJobById,
  getDeadJobs,
  retryDeadJob
} from "../controllers/job.controller";

const router = Router();

/**
 * Get job details
 * Permission: VIEW_LOGS
 */
router.get(
  "/:id",
  authMiddleware,
  requirePermission("VIEW_LOGS"),
  getJobById
);

/**
 * Get all dead jobs
 * Permission: VIEW_LOGS
 */
router.get(
  "/dead",
  authMiddleware,
  requirePermission("VIEW_LOGS"),
  getDeadJobs
);

/**
 * Retry dead job
 * Permission: MANAGE_USERS
 */
router.post(
  "/retry/:id",
  authMiddleware,
  requirePermission("CONFIGURE_SYSTEM"),
  retryDeadJob
);

export default router;
