import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}

export interface AiSettings {
    provider?: string;
    apiKey?: string;
    model?: string;
}

export const generateRAGResponse = async (
  query: string,
  contextChunks: string[],
  conversationHistory: ConversationMessage[] = [],
  aiSettings?: AiSettings
): Promise<string> => {
    // 1. Determine Gemini Settings
    const apiKey = aiSettings?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY as an environment variable.");
    }
    
    const modelName = aiSettings?.model || "gemini-1.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`✨ Generating response via Gemini API: [${modelName}]`);

    // 2. Format Context and History
    const contextText = contextChunks.map((c, i) => `[Document Chunk ${i + 1}]:\n${c}`).join("\n\n");
    
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

    // 3. Call Gemini API
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("❌ Gemini Fetch Error:", error.message);
        throw new Error(`Failed to generate response using Gemini API: ${error.message}`);
    }
};
