import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const getGenAIClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("❌ GEMINI_API_KEY is not defined");
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  }
  return { genAI, model };
};

/**
 * Utility: sleep
 */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Retry wrapper
 */
const embedWithRetry = async (
  text: string,
  retries = 5
): Promise<number[]> => {
  try {
    const { model } = getGenAIClient();
    const result = await model.embedContent(text);

    if (!result.embedding?.values) {
      throw new Error("Invalid embedding response");
    }

    return result.embedding.values;
  } catch (err: any) {
    const isRateLimit = err?.message?.includes("429");

    if (retries > 0 && isRateLimit) {
      const delay = (6 - retries) * 1000;
      console.warn(`⏳ Rate limited. Retrying in ${delay}ms...`);

      await sleep(delay);
      return embedWithRetry(text, retries - 1);
    }

    console.error("❌ Embedding failed:", err);
    throw err;
  }
};

/**
 * Single embedding
 */
export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    throw new Error("❌ Text is empty");
  }

  return embedWithRetry(text);
};

export const generateEmbeddingsBatch = async (
  texts: string[],
  batchSize = 20, // Google AI allows up to 100 per API call natively
  delayMs = 2000
): Promise<number[][]> => {
  if (!texts || texts.length === 0) {
    throw new Error("❌ No texts provided");
  }

  const results: number[][] = [];

  console.log(`🚀 Generating embeddings for ${texts.length} chunks`);

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    console.log(
      `📦 Processing true API Batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)`
    );

    try {
      // Map texts into the strictly typed EmbedContentRequest shape expected by batchEmbedContents
      const requests = batch.map((text) => ({
        content: { role: "user", parts: [{ text }] },
      }));

      const { model } = getGenAIClient();
      const batchResult = await model.batchEmbedContents({ requests });

      if (!batchResult.embeddings) {
        throw new Error("Invalid batch embedding response from Gemini");
      }

      // Extract raw number arrays
      const vectors = batchResult.embeddings.map((e: any) => e.values);
      results.push(...vectors);
      
    } catch (err: any) {
        console.error("❌ Batch embed failed:", err.message);
        throw err;
    }

    // ⏳ Polite rate limiting delay between massive batched requests
    if (i + batchSize < texts.length) {
      await sleep(delayMs);
    }
  }

  console.log("✅ All embeddings completed!");

  return results;
};