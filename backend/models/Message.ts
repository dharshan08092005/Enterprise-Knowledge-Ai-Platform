import { Schema, model, Types, Document } from "mongoose";

export interface IMessage extends Document {
  channelId: Types.ObjectId;
  senderId?: Types.ObjectId; // Optional because the KnowledgeBot can be the sender (null sender)
  isBot: boolean;
  content: string;
  sources?: { documentId: string; score: number }[];
}

const messageSchema = new Schema<IMessage>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    isBot: { type: Boolean, default: false },
    content: { type: String, required: true },
    sources: [
        {
            documentId: { type: String },
            score: { type: Number }
        }
    ]
  },
  { timestamps: true }
);

export default model<IMessage>("Message", messageSchema);
