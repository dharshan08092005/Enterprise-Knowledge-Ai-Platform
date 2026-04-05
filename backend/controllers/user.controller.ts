import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/Users";

export const getOrganizationUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        
        // Find users in the same organization
        const users = await User.find({ organizationId })
            .select("firstName lastName email departmentId role")
            .sort({ firstName: 1 });

        res.status(200).json(users);
    } catch(err: any) {
        console.error("Fetch organization users error:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const user = await User.findById(userId).select("-password").populate("organizationId departmentId");
        res.status(200).json(user);
    } catch(err: any) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
}

export const updateMe = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const { firstName, lastName, email } = req.body;
        
        const user = await User.findByIdAndUpdate(userId, { firstName, lastName, email }, { new: true }).select("-password");
        res.status(200).json(user);
    } catch(err: any) {
        res.status(500).json({ message: "Failed to update profile" });
    }
}
