import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/Users";
import { logAudit } from "../utils/auditLogger";
import Department from "../models/Department";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId, role } = req.user!;

        const query: any = {};
        if (organizationId) {
            query.organizationId = organizationId;
        }

        const users = await User.find(query)
            .select("_id name email roleId departmentId isActive createdAt")
            .populate("roleId", "name")
            .populate("departmentId", "name")
            .sort({ createdAt: -1 });

        // Map roleId.name → role for the frontend
        const mapped = users.map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.roleId?.name || "USER",
            isActive: u.isActive,
            createdAt: u.createdAt,
            departmentId: u.departmentId?._id || null,
            departmentName: u.departmentId?.name || null,
        }));

        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

export const getAuditors = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;

        // First find all auditor role IDs, then find users with that role
        const Role = (await import("../models/Roles")).default;
        const auditorRole = await Role.findOne({ name: "AUDITOR" });

        if (!auditorRole) {
            return res.json([]);
        }

        const query: any = { roleId: auditorRole._id };
        if (organizationId) {
            query.organizationId = organizationId;
        }

        const auditors = await User.find(query)
            .select("_id name email departmentId isActive createdAt")
            .populate("departmentId", "name")
            .sort({ createdAt: -1 });

        // Add the role name to each auditor for consistency
        const mapped = auditors.map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: "AUDITOR",
            isActive: u.isActive,
            createdAt: u.createdAt,
            departmentId: u.departmentId?._id || null,
            departmentName: u.departmentId?.name || null,
        }));

        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to fetch auditors"
        });
    }
};

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        const { email, name, role, departmentId } = req.body;

        if (!organizationId) {
            return res.status(403).json({ message: "Only Org Admins can create users" });
        }

        // Department is required for USER and AUDITOR roles
        if (!departmentId) {
            return res.status(400).json({ message: "Department is required when creating a user or auditor" });
        }

        // Validate department exists and belongs to the same org
        const dept = await Department.findOne({ _id: departmentId, organizationId });
        if (!dept) {
            return res.status(400).json({ message: "Invalid department or department does not belong to your organization" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Get Role ID
        const Role = (await import("../models/Roles")).default;
        const targetRole = await Role.findOne({ name: role || "USER" });
        if (!targetRole) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const { hashPassword } = await import("../utils/password");

        // Initial password = part of email before @ (as a "username" stand-in)
        const initialPassword = email.split('@')[0];
        const hashedPassword = await hashPassword(initialPassword);

        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            roleId: targetRole._id,
            organizationId,
            departmentId,
            isActive: true
        });

        await newUser.save();

        await logAudit({
            userId: req.user!.userId,
            organizationId: organizationId.toString(),
            action: "USER_CREATED",
            resourceType: "user",
            resourceId: newUser._id.toString(),
            metadata: {
                email: newUser.email,
                role: targetRole.name
            }
        });

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: targetRole.name,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
            departmentId: dept._id,
            departmentName: dept.name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create user" });
    }
};

/**
 * Update a user's department (ORG_ADMIN only)
 */
export const updateUserDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        const { id } = req.params;
        const { departmentId } = req.body;

        if (!organizationId) {
            return res.status(403).json({ message: "Only Org Admins can update departments" });
        }

        if (!departmentId) {
            return res.status(400).json({ message: "departmentId is required" });
        }

        // Validate department belongs to the org
        const dept = await Department.findOne({ _id: departmentId, organizationId });
        if (!dept) {
            return res.status(400).json({ message: "Invalid department or department does not belong to your organization" });
        }

        // Validate user belongs to the org
        const user = await User.findOne({ _id: id, organizationId });
        if (!user) {
            return res.status(404).json({ message: "User not found in your organization" });
        }

        user.departmentId = dept._id as any;
        await user.save();

        await logAudit({
            userId: req.user!.userId,
            organizationId: organizationId.toString(),
            action: "USER_DEPARTMENT_CHANGED",
            resourceType: "user",
            resourceId: user._id.toString(),
            metadata: {
                email: user.email,
                newDepartment: dept.name,
            }
        });

        res.json({
            message: "Department updated successfully",
            user: {
                _id: user._id,
                departmentId: dept._id,
                departmentName: dept.name,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update department" });
    }
};