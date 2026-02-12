import { Schema, model } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // ADMIN, USER, AUDITOR
      trim: true
    },
    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default model("Role", roleSchema);
