import { encode } from "gpt-tokenizer";

export const countTokens = (text: string): number => {
  return encode(text).length;
};
