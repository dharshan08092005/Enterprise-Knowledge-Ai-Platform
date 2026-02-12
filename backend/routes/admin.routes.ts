import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { getAuditLogs } from "../controllers/adminLogs.controller";
import { getSettings, updateSettings, testConnection } from "../controllers/settings.controller";
import {
  getAllUsers,
  getAuditors
} from "../controllers/adminUser.controller";

const router = Router();

// Audit Logs
router.get(
    "/logs",
    authMiddleware,
    requireRole("ADMIN", "AUDITOR"),
    getAuditLogs
);

// Settings
router.get(
    "/settings",
    authMiddleware,
    requireRole("ADMIN"),
    getSettings
);

router.put(
    "/settings",
    authMiddleware,
    requireRole("ADMIN"),
    updateSettings
);

router.post(
    "/settings/test-connection",
    authMiddleware,
    requireRole("ADMIN"),
    testConnection
);


export default router;
