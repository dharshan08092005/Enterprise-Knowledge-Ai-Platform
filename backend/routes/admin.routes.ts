import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import { getAuditLogs } from "../controllers/adminLogs.controller";
import {
  getSettings,
  updateSettings,
  testConnection
} from "../controllers/settings.controller";

const router = Router();

/**
 * Audit Logs
 * Permission: VIEW_LOGS
 */
router.get(
  "/logs",
  authMiddleware,
  requirePermission("VIEW_LOGS"),
  getAuditLogs
);

/**
 * System Settings
 * Permission: CONFIGURE_SYSTEM
 */
router.get(
  "/settings",
  authMiddleware,
  requirePermission("CONFIGURE_SYSTEM"),
  getSettings
);

router.put(
  "/settings",
  authMiddleware,
  requirePermission("CONFIGURE_SYSTEM"),
  updateSettings
);

router.post(
  "/settings/test-connection",
  authMiddleware,
  requirePermission("CONFIGURE_SYSTEM"),
  testConnection
);

export default router;
