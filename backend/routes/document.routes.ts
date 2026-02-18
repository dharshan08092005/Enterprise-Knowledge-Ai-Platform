import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
} from "../controllers/document.controller";

import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import { upload } from "../middleware/upload";

const router = Router();

/**
 * Upload Document
 * Allowed: SUPER_ADMIN, ORG_ADMIN, DEPT_MANAGER, USER
 * (Anyone who can query AI can upload)
 */
router.post(
  "/",
  authMiddleware,
  requirePermission("QUERY_AI"),
  upload.single("file"),
  createDocument
);

/**
 * Get Documents
 * Allowed: Anyone who can query AI or view logs
 */
router.get(
  "/",
  authMiddleware,
  requirePermission("QUERY_AI"),
  getDocuments
);

/**
 * Get Single Document
 */
router.get(
  "/:id",
  authMiddleware,
  requirePermission("QUERY_AI"),
  getDocumentById
);

/**
 * Delete Document
 * Only MANAGE_USERS permission (Super Admin / Org Admin)
 */
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("MANAGE_USERS"),
  deleteDocument
);

export default router;
