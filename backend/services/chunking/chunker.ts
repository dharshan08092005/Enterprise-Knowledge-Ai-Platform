import { countTokens } from "../../utils/tokenCounter";

interface Chunk {
  text: string;
  tokenCount: number;
}

export const chunkText = (
  text: string,
  maxTokens = 500,
  overlapTokens = 100
): Chunk[] => {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];

  let currentChunk = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = countTokens(paragraph);

    if (paragraphTokens > maxTokens) {
      // If paragraph too large, split by sentences
      const sentences = paragraph.split(/(?<=\.)\s+/);

      for (const sentence of sentences) {
        const sentenceTokens = countTokens(sentence);

        if (currentTokens + sentenceTokens > maxTokens) {
          chunks.push({
            text: currentChunk.trim(),
            tokenCount: currentTokens
          });

          // Overlap
          const overlapText = currentChunk
            .split(" ")
            .slice(-overlapTokens)
            .join(" ");

          currentChunk = overlapText + " " + sentence;
          currentTokens = countTokens(currentChunk);
        } else {
          currentChunk += " " + sentence;
          currentTokens += sentenceTokens;
        }
      }
    } else {
      if (currentTokens + paragraphTokens > maxTokens) {
        chunks.push({
          text: currentChunk.trim(),
          tokenCount: currentTokens
        });

        const overlapText = currentChunk
          .split(" ")
          .slice(-overlapTokens)
          .join(" ");

        currentChunk = overlapText + " " + paragraph;
        currentTokens = countTokens(currentChunk);
      } else {
        currentChunk += "\n\n" + paragraph;
        currentTokens += paragraphTokens;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      tokenCount: currentTokens
    });
  }

  return chunks;
};
