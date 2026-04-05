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

// All users can see their org for branding purposes, etc.
router.get("/my-org", orgController.getMyOrganization);
router.patch("/my-org/settings", requireRole("ORG_ADMIN"), orgController.updateMyOrgSettings);
router.post("/test-ai-config", requireRole("ORG_ADMIN"), orgController.testAiConfig);

export default router;
