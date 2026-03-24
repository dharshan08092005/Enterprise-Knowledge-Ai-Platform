import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export const generateRAGResponse = async (
  query: string,
  contextChunks: string[],
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextText = contextChunks.map((c, i) => `[Document Chunk ${i + 1}]:\n${c}`).join("\n\n");

    // Build conversation history string (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    let historyText = "";
    if (recentHistory.length > 0) {
        historyText = recentHistory
            .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n\n");
        historyText = `\n--- CONVERSATION HISTORY ---\n${historyText}\n`;
    }

    const prompt = `You are a helpful Enterprise AI Knowledge Assistant. 
You are tasked with answering the user's question based on the provided document context and conversation history below.
Use the conversation history to understand follow-up questions and maintain context across the conversation.
If the answer is not contained in the document context, do your best to answer it but politely mention that your enterprise knowledge base might not have this specific detail.

--- DOCUMENT CONTEXT ---
${contextText}
${historyText}
--- CURRENT USER QUESTION ---
${query}

--- ANSWER ---
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};
