import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { getJobById } from "../controllers/job.controller";
import { getDeadJobs } from "../controllers/job.controller";
import { retryDeadJob } from "../controllers/job.controller";

const router = Router();

router.get(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR"),
  getJobById
);

router.get(
  "/dead",
  authMiddleware,
  requireRole("ADMIN", "AUDITOR"),
  getDeadJobs
);

router.post(
  "/retry/:id",
  authMiddleware,
  requireRole("ADMIN"),
  retryDeadJob
);

export default router;
