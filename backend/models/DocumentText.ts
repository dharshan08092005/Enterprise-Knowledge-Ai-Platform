import mongoose from "mongoose";

const documentTextSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true
    },

    text: {
      type: String,
      required: true
    },

    pageCount: Number,

    extractionVersion: {
      type: String,
      default: "v1"
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "DocumentText",
  documentTextSchema
);
