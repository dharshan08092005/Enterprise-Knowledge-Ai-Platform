export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    throw new Error("❌ Text is empty");
  }

  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text",
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

export const generateEmbeddingsBatch = async (
  texts: string[],
  batchSize = 20,
  delayMs = 0
): Promise<number[][]> => {
  if (!texts || texts.length === 0) {
    throw new Error("❌ No texts provided");
  }

  const results: number[][] = [];
  console.log(`🚀 Generating embeddings for ${texts.length} chunks with Ollama (nomic-embed-text)`);

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)`);

    // Ollama currently processes embeddings sequentially or parallelly depending on load
    // We can fire them in parallel using Promise.all for this batch size
    const batchPromises = batch.map(text => generateEmbedding(text));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (err: any) {
      console.error("❌ Batch embed failed with Ollama:", err.message);
      throw err;
    }

    if (delayMs > 0 && i + batchSize < texts.length) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  console.log("✅ All embeddings completed!");
  return results;
};
