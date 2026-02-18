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

    roleId: {
      type: Types.ObjectId,
      ref: "Role",
      required: true
    },

    organizationId: {
      type: Types.ObjectId,
      ref: "Organization",
      required: true
    },

    departmentId: {
      type: Types.ObjectId,
      ref: "Department"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default model("User", userSchema);
