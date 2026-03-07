import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        const {
            limit = 50,
            page = 1,
            action,
            resourceType
        } = req.query;

        const filter: any = {};

        // If Org Admin, restrict to their organization's logs
        if (organizationId) {
            filter.organizationId = organizationId;
        }

        if (action && action !== "all") filter.action = action;
        if (resourceType && resourceType !== "all") filter.resourceType = resourceType;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await AuditLog.countDocuments(filter);

        const logs = await AuditLog.find(filter)
            .populate("userId", "name email")
            .populate("organizationId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            logs,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to fetch audit logs"
        });
    }
};
