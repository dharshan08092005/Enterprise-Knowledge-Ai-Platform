import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDB } from "./config/db";

connectDB();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
import { initSocket } from "./socket";
const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down server...");
  server.close(() => {
    console.log("Server closed");
  });
});
