// app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";



const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// API routes
app.use("/api", routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
