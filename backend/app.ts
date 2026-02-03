import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes"; // central routes index

const app: Application = express();

/* -------------------- GLOBAL MIDDLEWARE -------------------- */
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Enterprise AI Backend running",
  });
});

/* -------------------- API ROUTES -------------------- */
app.use("/api", routes);

/* -------------------- 404 HANDLER -------------------- */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  }
);

export default app;
