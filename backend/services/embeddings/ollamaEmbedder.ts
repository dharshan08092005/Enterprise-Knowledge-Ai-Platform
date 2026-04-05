import { GoogleGenerativeAI } from "@google/generative-ai";

export interface EmbeddingSettings {
    provider?: string;
    apiKey?: string;
    model?: string;
}

/**
 * Universal embedding generator that supports Ollama and Google Gemini Embeddings.
 */
export const generateEmbedding = async (text: string, settings?: EmbeddingSettings): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    throw new Error("❌ Text is empty");
  }

  const provider = settings?.provider || "ollama";
  const modelName = settings?.model || (provider === "ollama" ? "nomic-embed-text" : "text-embedding-004");

  if (provider === "google") {
    const key = settings?.apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Google API Key for embeddings is missing");
    
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  // Fallback to Ollama (default)
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (!data.embedding) {
    throw new Error("Invalid embedding response from Ollama");
  }

  return data.embedding;
};

/**
 * Batch generate embeddings with optional settings.
 */
export const generateEmbeddingsBatch = async (
  texts: string[],
  settings?: EmbeddingSettings,
  batchSize = 20,
  delayMs = 0
): Promise<number[][]> => {
  if (!texts || texts.length === 0) {
    throw new Error("❌ No texts provided");
  }

  const results: number[][] = [];
  const provider = settings?.provider || "ollama";
  console.log(`🚀 Generating embeddings for ${texts.length} chunks via ${provider}`);

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    // Process batch
    const batchPromises = batch.map(text => generateEmbedding(text, settings));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (err: any) {
      console.error(`❌ Batch embed failed with ${provider}:`, err.message);
      throw err;
    }

    if (delayMs > 0 && i + batchSize < texts.length) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  return results;
};
