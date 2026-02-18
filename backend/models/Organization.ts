import { Schema, model } from "mongoose";

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default model("Organization", organizationSchema);
