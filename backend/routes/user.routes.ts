import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getOrganizationUsers } from "../controllers/user.controller";

const router = Router();

router.use(authMiddleware);

// Endpoint for employees to find coworkers
router.get("/directory", getOrganizationUsers);

export default router;
