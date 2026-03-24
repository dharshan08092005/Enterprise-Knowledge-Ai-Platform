import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const run = async () => {
    try {
        console.log("Checking Gemini API Batch validity...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const res = await model.batchEmbedContents({
            requests: [
                { content: { role: "user", parts: [{ text: "Hello part 1" }]} },
                { content: { role: "user", parts: [{ text: "Hello part 2" }]} }
            ]
        });
        console.log("SUCCESS! Batch worked! Count:", res.embeddings?.length);
    } catch(err: any) {
        console.log("FAIL BATCH:", err.message);
    }
};

run();
