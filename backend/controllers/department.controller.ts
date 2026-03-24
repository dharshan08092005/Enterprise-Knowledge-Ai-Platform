import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Department from "../models/Department";

export const getDepartments = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        if (!organizationId) {
            return res.status(403).json({ message: "No organization associated" });
        }
        const departments = await Department.find({ organizationId });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch departments" });
    }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { organizationId } = req.user!;
        const { name, description } = req.body;

        if (!organizationId) {
            return res.status(403).json({ message: "No organization associated" });
        }

        const dept = await Department.create({
            name,
            description,
            organizationId
        });
        res.status(201).json(dept);
    } catch (err) {
        res.status(500).json({ message: "Failed to create department" });
    }
};
