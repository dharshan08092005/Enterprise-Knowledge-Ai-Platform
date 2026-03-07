import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
} from "../controllers/document.controller";

import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { upload } from "../middleware/upload";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "USER", "ORG_ADMIN"),
  upload.single("file"),
  createDocument
);

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR", "ORG_ADMIN"),
  getDocuments
);

router.get(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR", "ORG_ADMIN"),
  getDocumentById
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "ORG_ADMIN"),
  deleteDocument
);

export default router;