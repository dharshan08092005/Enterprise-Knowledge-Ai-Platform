import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { generateEmbedding } from "../services/embeddings/ollamaEmbedder";
import { searchSimilarChunks } from "../services/vectorDb/pineconeService";
import { generateRAGResponse } from "../services/llm/geminiChat";
import { logAudit } from "../utils/auditLogger";
import ChatSession from "../models/ChatSession";
import Organization from "../models/Organization";

/**
 * POST /api/chat
 * Send a message and get a RAG-powered response.
 * Optionally pass `sessionId` to continue an existing chat session.
 */
export const handleChatQuery = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { message, sessionId } = req.body;
    const { userId, organizationId, role } = req.user!;

    if (!message) {
      return res.status(400).json({ message: "Query message is required" });
    }

    if (!organizationId) {
      return res.status(403).json({ message: "Global Admins cannot use tenant chat" });
    }

    console.log(`💬 User ${userId} querying: "${message}"`);

    // 3.5. Fetch Organization specific settings (BYOK)
    const org = await Organization.findById(organizationId).select("+aiSettings.apiKey +embeddingSettings.apiKey").lean();
    const aiSettings = org?.aiSettings;
    const embeddingSettings = org?.embeddingSettings;

    // 1. Embed query with org-specific settings
    const queryEmbedding = await generateEmbedding(message, embeddingSettings as any);

    // 2. Vector search in Pinecone with strict RBAC filtering
    const similarChunks = await searchSimilarChunks(
      organizationId.toString(),
      userId.toString(),
      role,
      (req.user as any)?.departmentId?.toString(),
      queryEmbedding,
      5 // Top K
    );

    // Context texts extracted from Pinecone metadata
    const contextTexts = similarChunks
      .map(match => match.metadata?.text as string)
      .filter(Boolean);

    console.log(`🔍 Retrieved ${contextTexts.length} similar chunks.`);

    // 3. Build conversation history for memory
    let conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    if (sessionId) {
      const existingSession = await ChatSession.findOne({ _id: sessionId, userId }).lean();
      if (existingSession?.messages) {
        conversationHistory = existingSession.messages.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
      }
    }

    
    // 4. Send to LLM with conversation history and org-specific settings
    const answer = await generateRAGResponse(message, contextTexts, conversationHistory, aiSettings);

    // 4. Build unique sources
    const uniqueSourcesArray = similarChunks
      .filter(match => match.metadata?.documentId)
      .map(match => ({ documentId: match.metadata?.documentId as string, score: match.score }));
      
    // Deduplicate by document ID
    const sources = Array.from(new Map(uniqueSourcesArray.map(item => [item.documentId, item])).values());

    // 5. Save to chat session
    let session;
    if (sessionId) {
      // Append to existing session
      session = await ChatSession.findOne({ _id: sessionId, userId });
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
    } else {
      // Create new session — generate title from first message
      const title = message.length > 50 ? message.substring(0, 50) + "..." : message;
      session = new ChatSession({
        userId,
        organizationId,
        title,
        messages: [],
      });
    }

    // Push user message
    session.messages.push({
      role: "user",
      content: message,
      sources: [],
    });

    // Push assistant message
    session.messages.push({
      role: "assistant",
      content: answer,
      sources: sources.map(s => ({
        documentId: s.documentId,
        score: s.score,
      })),
    });

    await session.save();

    // 6. Log Audit
    await logAudit({
      userId,
      organizationId,
      action: "CHAT_QUERY",
      resourceType: "chat",
      resourceId: session._id.toString(),
      metadata: {
        query: message,
        chunksRetrieved: contextTexts.length,
      },
    });

    res.json({
      answer,
      sources,
      sessionId: session._id,
    });

  } catch (error: any) {
    console.error("Chat error:", error.message);
    res.status(500).json({ message: "Failed to process chat query." });
  }
};

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the current user (most recent first).
 */
export const getChatSessions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId } = req.user!;

    const sessions = await ChatSession.find({ userId })
      .select("title messages updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    const result = sessions.map((s: any) => {
      const lastMsg = s.messages?.[s.messages.length - 1];
      return {
        id: s._id,
        title: s.title,
        lastMessage: lastMsg?.content?.substring(0, 80) || "",
        timestamp: s.updatedAt,
        messageCount: s.messages?.length || 0,
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error("Get sessions error:", error.message);
    res.status(500).json({ message: "Failed to fetch chat sessions." });
  }
};

/**
 * GET /api/chat/sessions/:id
 * Get a single chat session with all messages.
 */
export const getChatSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const session = await ChatSession.findOne({ _id: id, userId }).lean();

    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    res.json(session);
  } catch (error: any) {
    console.error("Get session error:", error.message);
    res.status(500).json({ message: "Failed to fetch chat session." });
  }
};

/**
 * DELETE /api/chat/sessions/:id
 * Delete a chat session.
 */
export const deleteChatSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const session = await ChatSession.findOneAndDelete({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    res.json({ message: "Chat session deleted" });
  } catch (error: any) {
    console.error("Delete session error:", error.message);
    res.status(500).json({ message: "Failed to delete chat session." });
  }
};
