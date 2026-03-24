import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { getKnowledgeBase } from "../controllers/knowledgeBase.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN", "USER", "AUDITOR", "ORG_ADMIN"),
  getKnowledgeBase
);

export default router;
