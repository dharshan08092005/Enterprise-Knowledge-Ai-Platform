import { Router } from "express";

const router = Router();

// example
router.get("/", (_req, res) => {
  res.json({ message: "API root" });
});

// later:
// router.use("/auth", authRoutes);
// router.use("/documents", documentRoutes);

export default router;
