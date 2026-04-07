import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function test() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key?.substring(0, 10) + "...");

    if (!key) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    
    // Try different models
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\nTesting model: [${modelName}]...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello World'");
            const response = await result.response;
            console.log(`✅ Success with ${modelName}:`, response.text());
        } catch (e: any) {
            console.error(`❌ Failed with ${modelName}:`, e.message);
            if (e.stack) {
                // Check if it's a 404 or something else
                if (e.message.includes("404")) {
                    console.log("   -> Reason: Model truly not found for this key.");
                }
            }
        }
    }
}

test();
