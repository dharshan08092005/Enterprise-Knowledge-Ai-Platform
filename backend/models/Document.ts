import { Schema, model, Types, Document } from "mongoose";

interface IDocument extends Document {
  title: string;
  ownerId: Types.ObjectId;
  organizationId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  accessScope: "public" | "organization" | "department" | "restricted";
  allowedRoles: Types.ObjectId[];
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  status: "uploaded" | "processing" | "active";
  pageCount?: number;
  chunkCount?: number;
}

const documentSchema = new Schema<IDocument>(
  {
    // Basic metadata
    title: {
      type: String,
      required: true
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department"
    },

    // Access control (future RAG + RBAC)
    accessScope: {
      type: String,
      enum: ["public", "organization", "department", "restricted"],
      default: "restricted" // 🔐 SAFE DEFAULT
    },

    allowedRoles: [
      {
        type: Schema.Types.ObjectId,
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
    },

    pageCount: {
      type: Number,
      default: 0
    },

    chunkCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default model<IDocument>("Document", documentSchema);
