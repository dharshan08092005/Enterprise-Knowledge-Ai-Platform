import { Schema, model, Types } from "mongoose";

/**
 * RefreshToken Schema
 * -------------------
 * Stores long-lived session tokens.
 * These are revocable and rotated.
 */
const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },

    token: {
      type: String,
      required: true,
      unique: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default model("RefreshToken", refreshTokenSchema);
