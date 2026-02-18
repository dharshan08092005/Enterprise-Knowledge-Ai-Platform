import { Schema, model, Types } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true },
    organizationId: {
      type: Types.ObjectId,
      ref: "Organization",
      required: true
    }
  },
  { timestamps: true }
);

export default model("Department", departmentSchema);
