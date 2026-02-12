import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { getKnowledgeBase } from "../controllers/knowledgebase.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR"),
  getKnowledgeBase
);

export default router;
