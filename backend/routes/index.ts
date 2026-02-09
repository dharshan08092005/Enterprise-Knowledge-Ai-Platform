import { Router } from "express";
import authRoutes from "./auth.routes";
import documentRoutes from "./document.routes";
import jobRoutes from "./job.routes";
import knowledgeBaseRoutes from "./knowledgeBase.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/jobs", jobRoutes);
router.use("/knowledge-base", knowledgeBaseRoutes);

export default router;
