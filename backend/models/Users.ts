import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: String,
    organizationId: {
      type: Types.ObjectId,
      ref: "Organization",
      // Optional for Super Admin, required for others
    },
    departmentId: {
      type: Types.ObjectId,
      ref: "Department"
    },
    roleId: {
      type: Types.ObjectId,
      ref: "Role",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default model("User", userSchema);
