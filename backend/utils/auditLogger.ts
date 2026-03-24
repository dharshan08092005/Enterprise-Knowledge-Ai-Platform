import AuditLog from "../models/AuditLog";

/**
 * logAudit
 * --------
 * Centralized function to record audit events.
 * This should NEVER throw errors that break user flow.
 */
export const logAudit = async ({
  userId,
  organizationId,
  action,
  resourceType,
  resourceId,
  metadata
}: {
  userId?: string;
  organizationId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    await AuditLog.create({
      userId,
      organizationId,
      action,
      resourceType,
      resourceId,
      metadata
    });
  } catch (err) {
    // IMPORTANT: Audit failure should NOT break the main request
    console.error("Audit log failed:", err);
  }
};
