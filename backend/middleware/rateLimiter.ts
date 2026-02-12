import rateLimit from "express-rate-limit";

/**
 * Login rate limiter
 * ------------------
 * Protects against brute-force login attempts.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later."
  }
});

/**
 * Signup rate limiter
 * -------------------
 * Prevents automated account creation.
 */
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 signups per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many signup attempts. Please try again later."
  }
});
