import crypto from "crypto";

/**
 * Generates a cryptographically secure refresh token
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};
