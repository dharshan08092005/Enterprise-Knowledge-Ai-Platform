// models/Document.ts
import { Schema, model, Types } from "mongoose";

const documentSchema = new Schema(
  {
    title: String,
    ownerId: { type: Types.ObjectId, ref: "User" },
    accessScope: {
      type: String,
      enum: ["public", "department", "restricted"],
      required: true
    },
    allowedRoles: [{ type: Types.ObjectId, ref: "Role" }],
    status: {
      type: String,
      enum: ["uploaded", "processing", "active"],
      default: "uploaded"
    }
  },
  { timestamps: true }
);

export default model("Document", documentSchema);
