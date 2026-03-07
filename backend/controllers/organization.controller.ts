import { Request, Response } from "express";
import Organization from "../models/Organization";

export const getOrganizations = async (req: Request, res: Response) => {
    try {
        const orgs = await Organization.find().sort({ createdAt: -1 });
        res.json(orgs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch organizations" });
    }
};

export const createOrganization = async (req: Request, res: Response) => {
    try {
        const { name, slug, domain } = req.body;
        const org = await Organization.create({ name, slug, domain });
        res.status(201).json(org);
    } catch (err) {
        res.status(500).json({ message: "Failed to create organization" });
    }
};

export const updateOrganization = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive, subscriptionPlan } = req.body;
        const org = await Organization.findByIdAndUpdate(id, { isActive, subscriptionPlan }, { new: true });
        res.json(org);
    } catch (err) {
        res.status(500).json({ message: "Failed to update organization" });
    }
};
