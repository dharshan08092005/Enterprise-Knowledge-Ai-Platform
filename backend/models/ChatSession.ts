import { Schema, model, Types } from "mongoose";

/**
 * ChatSession Schema
 * ------------------
 * Stores individual chat sessions for the Ask AI feature.
 * Each session contains an array of messages (user + assistant).
 */

const chatMessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [
      {
        documentId: String,
        score: Number,
        title: String,
        excerpt: String,
      },
    ],
  },
  { timestamps: true }
);

const chatSessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [chatMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
chatSessionSchema.index({ userId: 1, updatedAt: -1 });

export default model("ChatSession", chatSessionSchema);
