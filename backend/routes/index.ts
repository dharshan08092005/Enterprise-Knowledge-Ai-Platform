import { Router } from "express";
import authRoutes from "./auth.routes";
import documentRoutes from "./document.routes";
import jobRoutes from "./job.routes";
import knowledgeBaseRoutes from "./knowledgeBase.routes";
import adminRoutes from "./admin.routes";
import adminUserRoutes from "./admin.user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/jobs", jobRoutes);
router.use("/knowledge-base", knowledgeBaseRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/users", adminUserRoutes);

export default router;
