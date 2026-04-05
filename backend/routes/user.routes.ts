import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getOrganizationUsers, getMe, updateMe } from "../controllers/user.controller";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMe);
router.patch("/me", updateMe);

// Endpoint for employees to find coworkers
router.get("/directory", getOrganizationUsers);

export default router;
