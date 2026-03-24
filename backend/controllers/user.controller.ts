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
