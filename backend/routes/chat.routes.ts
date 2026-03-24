import { Router } from "express";
import { handleChatQuery } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Chat is accessible by internal tenant users, org admins, admins, etc.
// But handled in controller to skip global admins.
router.post(
  "/",
  authMiddleware,
  handleChatQuery
);

export default router;
