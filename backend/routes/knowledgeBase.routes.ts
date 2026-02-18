import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import { PERMISSIONS } from "../constants/permissions";
import { getKnowledgeBase } from "../controllers/knowledgeBase.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.QUERY_AI),
  getKnowledgeBase
);

export default router;
