import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true
    },

    chunkIndex: {
      type: Number,
      required: true
    },

    text: {
      type: String,
      required: true
    },

    tokenCount: {
      type: Number,
      required: true
    },

    embeddingStatus: {
      type: String,
      enum: ["pending", "embedded", "failed"],
      default: "pending"
    },

    embeddingModel: String
  },
  { timestamps: true }
);

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);
