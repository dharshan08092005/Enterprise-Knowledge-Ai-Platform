import { Router } from "express";
import authRoutes from "./auth.routes";
import documentRoutes from "./document.routes";
import jobRoutes from "./job.routes";
import knowledgeBaseRoutes from "./knowledgeBase.routes";
import adminRoutes from "./admin.routes";
import adminUserRoutes from "./admin.user.routes";
import organizationRoutes from "./organization.routes";
import departmentRoutes from "./department.routes";
import chatRoutes from "./chat.routes";

import channelRoutes from "./channels.routes";
import userRoutes from "./user.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/jobs", jobRoutes);
router.use("/knowledge-base", knowledgeBaseRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/organizations", organizationRoutes);
router.use("/departments", departmentRoutes);
router.use("/chat", chatRoutes);
router.use("/channels", channelRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
