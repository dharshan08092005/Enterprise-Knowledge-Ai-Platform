import { Schema, model, Types } from "mongoose";

/**
 * AuditLog Schema
 * ----------------
 * Stores security- and compliance-critical events.
 * This collection should be append-only.
 */
const auditLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: false // login failure may not have userId
    },

    action: {
      type: String,
      required: true
      // examples: USER_SIGNUP, USER_LOGIN, LOGIN_FAILED
    },

    resourceType: {
      type: String
      // examples: auth, document, query
    },

    resourceId: {
      type: Types.ObjectId
    },

    metadata: {
      type: Schema.Types.Mixed
      // flexible field for IP, email, error reason, etc.
    }
  },
  {
    timestamps: true
  }
);

export default model("AuditLog", auditLogSchema);
