import { Router } from "express";
import {
  handleChatQuery,
  getChatSessions,
  getChatSession,
  deleteChatSession,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Send a chat message (creates or continues a session)
router.post("/", authMiddleware, handleChatQuery);

// Get all chat sessions for the current user
router.get("/sessions", authMiddleware, getChatSessions);

// Get a single chat session by ID
router.get("/sessions/:id", authMiddleware, getChatSession);

// Delete a chat session
router.delete("/sessions/:id", authMiddleware, deleteChatSession);

export default router;
