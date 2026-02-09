import { Schema, model, Types } from "mongoose";

/**
 * Job Schema
 * ----------
 * Represents async background tasks.
 */
const jobSchema = new Schema(
  {
    type: {
      type: String,
      required: true
      // e.g. DOCUMENT_PROCESSING
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "DEAD"
      ],
      default: "PENDING"
    },

    documentId: {
      type: Types.ObjectId,
      ref: "Document",
      required: true
    },

    attempts: {
      type: Number,
      default: 0
    },

    maxAttempts: {
      type: Number,
      default: 3
    },

    nextRunAt: {
      type: Date,
      default: Date.now
    },

    error: {
      type: String
    },

    payload: {
      type: Schema.Types.Mixed
      // extensible for future job types
    }
  },
  {
    timestamps: true
  }
);

export default model("Job", jobSchema);
