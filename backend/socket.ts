import { Server, Socket } from "socket.io";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import Message from "./models/Message";
import Channel from "./models/Channel";
import { generateEmbedding } from "./services/embeddings/geminiEmbedder";
import { searchSimilarChunks } from "./services/vectorDb/pineconeService";
import { generateRAGResponse } from "./services/llm/geminiChat";

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (!decoded.userId || !decoded.role) {
        return next(new Error("Authentication error: Invalid token payload"));
      }
      socket.data.user = {
        userId: decoded.userId,
        role: decoded.role,
        organizationId: decoded.organizationId,
        departmentId: decoded.departmentId
      };
      next();
    } catch (err: any) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User ${socket.data.user.userId} connected via WebSocket`);

    // Join a specific channel
    socket.on("join_channel", async (channelId: string) => {
      // Basic validation: user should belong to the org of the channel
      const channel = await Channel.findById(channelId);
      if (channel && channel.organizationId.toString() === socket.data.user.organizationId) {
          socket.join(channelId);
          console.log(`User ${socket.data.user.userId} joined channel ${channelId}`);
      } else {
          socket.emit("error", { message: "Unauthorized or Channel not found" });
      }
    });

    // Leave a channel
    socket.on("leave_channel", (channelId: string) => {
      socket.leave(channelId);
      console.log(`User ${socket.data.user.userId} left channel ${channelId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data: { channelId: string; content: string; isBot?: boolean; sources?: any[] }) => {
      try {
        const { channelId, content } = data;
        
        // 1. Save user message to database
        const userMsg = await Message.create({
            channelId,
            senderId: socket.data.user.userId,
            isBot: false,
            content
        });

        // 2. Broadcast user message to room
        io.to(channelId).emit("receive_message", userMsg);

        // 3. AI INTERCEPTOR ("@AI" or "@KnowledgeBot")
        if (content.toLowerCase().includes("@ai") || content.toLowerCase().includes("@knowledgebot")) {
             
            // Tell the channel the AI is thinking
            io.to(channelId).emit("bot_typing", { channelId, isTyping: true });

            try {
                const query = content.replace(/@(ai|knowledgebot)/gi, "").trim();
                const organizationId = socket.data.user.organizationId;
                const userId = socket.data.user.userId;
                const role = socket.data.user.role;
                const departmentId = socket.data.user.departmentId;

                // Embed the prompt
                const queryEmbedding = await generateEmbedding(query);

                // Fetch context specific to THIS user's RBAC scope
                const similarChunks = await searchSimilarChunks(
                    organizationId,
                    userId,
                    role,
                    departmentId,
                    queryEmbedding,
                    5
                );

                const contextTexts = similarChunks.map(m => m.metadata?.text as string).filter(Boolean);
                const answer = await generateRAGResponse(query, contextTexts);

                const uniqueSourcesArray = similarChunks
                    .filter(match => match.metadata?.documentId)
                    .map(match => ({ documentId: match.metadata?.documentId as string, score: match.score }));
                
                const sources = Array.from(new Map(uniqueSourcesArray.map(item => [item.documentId, item])).values());

                // Save bot message to DB
                const botMsg = await Message.create({
                    channelId,
                    isBot: true,
                    content: answer,
                    sources: sources
                });

                // Broadcast bot response
                io.to(channelId).emit("receive_message", botMsg);

            } catch(aiError: any) {
                console.error("AI Assistant Error:", aiError);
                io.to(channelId).emit("error", { message: "KnowledgeBot failed to process your request." });
            } finally {
                io.to(channelId).emit("bot_typing", { channelId, isTyping: false });
            }
        }

      } catch (err: any) {
        console.error("Socket send_message error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User ${socket.data.user.userId} disconnected`);
    });
  });

  return io;
};
