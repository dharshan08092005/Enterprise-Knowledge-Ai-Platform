import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createChannel, getMyChannels, getChannelMessages } from "../controllers/channel.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createChannel);
router.get("/", getMyChannels);
router.get("/:channelId/messages", getChannelMessages);

export default router;
