import { Schema, model } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    permissions: [
      {
        type: String,
        required: true
      }
    ],
    description: String
  },
  { timestamps: true }
);

export default model("Role", roleSchema);
