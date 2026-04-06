import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ChatSession from "../models/ChatSession";
import Document from "../models/Document";
import User from "../models/Users";
import Organization from "../models/Organization";

export const getAdminStats = async (req: AuthRequest, res: Response) => {
    try {
        const { role, organizationId } = req.user!;

        // Base queries
        const userQuery = role === "ADMIN" ? {} : { organizationId };
        const orgQuery = role === "ADMIN" ? {} : { _id: organizationId };
        const docQuery = role === "ADMIN" ? {} : { organizationId };
        const chatQuery = role === "ADMIN" ? {} : { organizationId };

        const totalUsers = await User.countDocuments(userQuery);

        const totalQueriesAgg = await ChatSession.aggregate([
            { $match: chatQuery },
            { $project: { messageCount: { $size: "$messages" } } },
            { $group: { _id: null, total: { $sum: "$messageCount" } } }
        ]);
        const queriesCount = totalQueriesAgg[0]?.total || 0;

        const totalDocuments = await Document.countDocuments(docQuery);
        const totalOrganizations = await Organization.countDocuments(orgQuery);

        // Also get some recent activity
        const recentDocs = await Document.find(docQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title createdAt ownerId")
            .populate("ownerId", "name")
            .lean();

        res.json({
            stats: [
                {
                    title: "Total Queries",
                    value: queriesCount.toLocaleString(),
                    change: "+12.5%",
                    changeType: "up",
                },
                {
                    title: "Knowledge Items",
                    value: totalDocuments.toLocaleString(),
                    change: "+8.2%",
                    changeType: "up",
                },
                {
                    title: "Total Users",
                    value: totalUsers.toLocaleString(),
                    change: "+2",
                    changeType: "up",
                },
                {
                    title: "Organizations",
                    value: totalOrganizations.toLocaleString(),
                    change: "+0",
                    changeType: "up",
                }
            ],
            recentActivity: recentDocs.map(d => ({
                title: "New document uploaded",
                description: `${d.title} added by ${((d as any).ownerId as any)?.name || 'a user'}`,
                time: (d as any).createdAt,
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, organizationId } = req.user!;

        const sessions = await ChatSession.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(4)
            .lean();

        const recentQueries = sessions.map(s => ({
            query: s.title || "Chat session",
            time: s.updatedAt,
            category: "General"
        }));

        const docsCount = await Document.countDocuments({ organizationId });

        res.json({
            recentQueries,
            stats: {
                docsCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user stats" });
    }
};
