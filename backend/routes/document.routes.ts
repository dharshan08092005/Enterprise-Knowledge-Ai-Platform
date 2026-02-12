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
  requireRole("ADMIN", "USER"),
  upload.single("file"),
  createDocument
);

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR"),
  getDocuments
);

router.get(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR"),
  getDocumentById
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteDocument
);

export default router;