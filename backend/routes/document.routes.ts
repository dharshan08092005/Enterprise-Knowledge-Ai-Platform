// routes/document.routes.ts
import { Router } from "express";
import { createDocument, getDocuments } from "../controllers/document.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getDocuments);

export default router;
