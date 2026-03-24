import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import * as deptController from "../controllers/department.controller";

const router = Router();

router.use(authMiddleware);

// Org Admins and Standard Admins can manage departments
router.get("/", requireRole("ADMIN", "ORG_ADMIN"), deptController.getDepartments);
router.post("/", requireRole("ADMIN", "ORG_ADMIN"), deptController.createDepartment);

export default router;
