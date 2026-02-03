import http from "http";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* -------------------- GRACEFUL SHUTDOWN -------------------- */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down server...");
  server.close(() => {
    console.log("Server closed");
  });
});
