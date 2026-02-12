import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import {
  loginRateLimiter,
  signupRateLimiter
} from "../middleware/rateLimiter";
import { refreshAccessToken } from "../controllers/auth.controller";
import { logout } from "../controllers/auth.controller";


const router = Router();

router.post("/signup", signupRateLimiter, signup);
router.post("/login", loginRateLimiter, login);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;