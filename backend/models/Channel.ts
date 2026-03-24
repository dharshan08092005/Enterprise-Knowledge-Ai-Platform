import { Schema, model, Types, Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  description?: string;
  organizationId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  isPrivate: boolean;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
}

const channelSchema = new Schema<IChannel>(
  {
    name: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    isPrivate: { type: Boolean, default: false },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model<IChannel>("Channel", channelSchema);
