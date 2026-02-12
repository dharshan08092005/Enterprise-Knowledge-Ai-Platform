import { Request, Response } from "express";
import AuditLog from "../models/AuditLog";

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const {
            limit = 50,
            page = 1,
            action,
            resourceType
        } = req.query;

        const filter: any = {};

        if (action && action !== "all") filter.action = action;
        if (resourceType && resourceType !== "all") filter.resourceType = resourceType;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await AuditLog.countDocuments(filter);

        const logs = await AuditLog.find(filter)
            .populate("userId", "name email")
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
