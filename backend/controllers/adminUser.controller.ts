import { Request, Response } from "express";
import User from "../models/Users";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("_id name email roleId isActive createdAt")
            .populate("roleId", "name")
            .sort({ createdAt: -1 });

        // Map roleId.name → role for the frontend
        const mapped = users.map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.roleId?.name || "USER",
            isActive: u.isActive,
            createdAt: u.createdAt,
        }));

        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

export const getAuditors = async (req: Request, res: Response) => {
    try {
        // First find all auditor role IDs, then find users with that role
        const Role = (await import("../models/Roles")).default;
        const auditorRole = await Role.findOne({ name: "AUDITOR" });

        if (!auditorRole) {
            return res.json([]);
        }

        const auditors = await User.find({ roleId: auditorRole._id })
            .select("_id name email isActive createdAt")
            .sort({ createdAt: -1 });

        // Add the role name to each auditor for consistency
        const mapped = auditors.map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: "AUDITOR",
            isActive: u.isActive,
            createdAt: u.createdAt,
        }));

        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to fetch auditors"
        });
    }
};
