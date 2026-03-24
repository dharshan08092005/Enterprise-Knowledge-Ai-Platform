import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import * as orgController from "../controllers/organization.controller";

const router = Router();

router.use(authMiddleware);

// Only Super Admin (global ADMIN) can manage organizations
router.get("/", requireRole("ADMIN"), orgController.getOrganizations);
router.post("/", requireRole("ADMIN"), orgController.createOrganization);
router.patch("/:id", requireRole("ADMIN"), orgController.updateOrganization);

export default router;
