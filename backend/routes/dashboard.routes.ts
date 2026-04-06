import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { getAdminStats, getUserStats } from "../controllers/dashboard.controller";

const router = Router();

// Dashboard routes for Admin/Org Admin
router.get(
    "/admin",
    authMiddleware,
    requireRole("ADMIN", "ORG_ADMIN", "AUDITOR"),
    getAdminStats
);

// Dashboard routes for normal Users
router.get(
    "/user",
    authMiddleware,
    getUserStats
);

export default router;
