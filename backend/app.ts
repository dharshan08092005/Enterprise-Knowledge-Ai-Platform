// app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";



const app = express();

// Global middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.send("healthy");
});

// API routes
app.use("/api", routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
