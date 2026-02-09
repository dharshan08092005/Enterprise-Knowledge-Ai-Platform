// models/Document.ts
import { Schema, model, Types } from "mongoose";

const documentSchema = new Schema(
  {
    // Basic metadata
    title: {
      type: String,
      required: true
    },

    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },

    // Access control (future RAG + RBAC)
    accessScope: {
      type: String,
      enum: ["public", "department", "restricted"],
      default: "restricted" // 🔐 SAFE DEFAULT
    },

    allowedRoles: [
      {
        type: Types.ObjectId,
        ref: "Role"
      }
    ],

    // File metadata
    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    },

    // Processing lifecycle
    status: {
      type: String,
      enum: ["uploaded", "processing", "active"],
      default: "uploaded"
    }
  },
  {
    timestamps: true
  }
);

export default model("Document", documentSchema);
