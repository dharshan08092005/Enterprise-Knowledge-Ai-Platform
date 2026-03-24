import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { generateEmbedding } from "../services/embeddings/geminiEmbedder";
import { searchSimilarChunks } from "../services/vectorDb/pineconeService";
import { generateRAGResponse } from "../services/llm/geminiChat";
import { logAudit } from "../utils/auditLogger";

export const handleChatQuery = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { message } = req.body;
    const { userId, organizationId, role } = req.user!;

    if (!message) {
      return res.status(400).json({ message: "Query message is required" });
    }

    if (!organizationId) {
      return res.status(403).json({ message: "Global Admins cannot use tenant chat" });
    }

    console.log(`💬 User ${userId} querying: "${message}"`);

    // 1. Embed query
    const queryEmbedding = await generateEmbedding(message);

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

    // 3. Log Audit
    await logAudit({
        userId,
        organizationId,
        action: "CHAT_QUERY",
        resourceType: "chat",
        resourceId: "chat-session",
        metadata: {
            query: message,
            chunksRetrieved: contextTexts.length
        }
    });

    // 4. Send to Gemini
    const answer = await generateRAGResponse(message, contextTexts);

    // 5. Build unique sources
    const uniqueSourcesArray = similarChunks
      .filter(match => match.metadata?.documentId)
      .map(match => ({ documentId: match.metadata?.documentId as string, score: match.score }));
      
    // Deduplicate by document ID
    const sources = Array.from(new Map(uniqueSourcesArray.map(item => [item.documentId, item])).values());

    res.json({
        answer,
        sources
    });

  } catch (error: any) {
    console.error("Chat error:", error.message);
    res.status(500).json({ message: "Failed to process chat query." });
  }
};
