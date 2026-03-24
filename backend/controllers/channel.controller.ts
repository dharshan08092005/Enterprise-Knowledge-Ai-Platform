import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Channel from "../models/Channel";
import Message from "../models/Message";

// Create a new channel
export const createChannel = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, isPrivate, members, departmentId } = req.body;
        const { organizationId, userId, role } = req.user!;

        // Simple RBAC: Admins or the user can create channels in their org
        const newChannel = await Channel.create({
            name,
            description,
            organizationId,
            departmentId: departmentId || req.user?.departmentId,
            isPrivate: isPrivate || false,
            members: members || [userId],
            createdBy: userId
        });

        const populatedChannel = await newChannel.populate("members", "firstName lastName email");

        res.status(201).json(populatedChannel);
    } catch(err: any) {
        console.error("Create channel error:", err);
        res.status(500).json({ message: "Failed to create channel" });
    }
};

// Get channels for current user
export const getMyChannels = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId, userId, departmentId, role } = req.user!;

        // Admins see all org channels, otherwise check department and private member arrays
        const query: any = { organizationId };

        if (role !== "ADMIN" && role !== "ORG_ADMIN") {
            query["$or"] = [
                { isPrivate: false },
                { isPrivate: true, members: userId }
            ];
            // If department scoped channel logic applies, we would expand this
            if (departmentId) {
                // e.g. see channels in my department or global non-private ones
            }
        }

        const channels = await Channel.find(query).populate("members", "firstName lastName").sort({ createdAt: -1 });
        res.status(200).json(channels);
    } catch(err: any) {
        console.error("Fetch channels error:", err);
        res.status(500).json({ message: "Failed to fetch channels" });
    }
};

// Get messages for a channel
export const getChannelMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { channelId } = req.params;
        const messages = await Message.find({ channelId })
            .populate("senderId", "firstName lastName")
            .sort({ createdAt: 1 })
            .limit(100);

        res.status(200).json(messages);
    } catch(err: any) {
        console.error("Fetch messages error:", err);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}
