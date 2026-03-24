import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateRAGResponse = async (query: string, contextChunks: string[]): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-pro or gemini-1.5-flash for chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contextText = contextChunks.map((c, i) => `[Document Chunk ${i + 1}]:\n${c}`).join("\n\n");

    const prompt = `You are a helpful Enterprise AI Knowledge Assistant. 
You are tasked with answering the user's question based strictly on the provided document context below.
If the answer is not contained in the context, do your best to answer it but politely mention that your enterprise knowledge base might not have this specific detail.

--- CONTEXT ---
${contextText}

--- USER QUESTION ---
${query}

--- ANSWER ---
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};
