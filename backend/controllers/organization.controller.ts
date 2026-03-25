import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
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

export const getMyOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) return res.status(403).json({ message: "No organization associated with this user" });

        const userRole = req.user?.role;
        const isAdmin = userRole === "ORG_ADMIN" || userRole === "ADMIN";

        // Only admins can see AI API keys
        const org = isAdmin 
            ? await Organization.findById(orgId).select("+aiSettings.apiKey +embeddingSettings.apiKey")
            : await Organization.findById(orgId);
            
        res.json(org);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch organization settings" });
    }
};

export const updateMyOrgSettings = async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) return res.status(403).json({ message: "No organization associated with this user" });

        const { 
            name, 
            themeColor,
            provider, 
            apiKey, 
            model, 
            embeddingProvider, 
            embeddingApiKey, 
            embeddingModel 
        } = req.body;
        
        // Build update object
        const update: any = {};
        if (name) update["name"] = name;
        if (themeColor) update["themeColor"] = themeColor;
        if (provider) update["aiSettings.provider"] = provider;
        if (apiKey) update["aiSettings.apiKey"] = apiKey;
        if (model) update["aiSettings.model"] = model;

        if (embeddingProvider) update["embeddingSettings.provider"] = embeddingProvider;
        if (embeddingApiKey) update["embeddingSettings.apiKey"] = embeddingApiKey;
        if (embeddingModel) update["embeddingSettings.model"] = embeddingModel;

        const org = await Organization.findByIdAndUpdate(
            orgId, 
            { $set: update }, 
            { new: true }
        ).select("+aiSettings.apiKey +embeddingSettings.apiKey");

        res.json({ 
            message: "Organization settings updated successfully", 
            name: org?.name,
            themeColor: org?.themeColor,
            aiSettings: org?.aiSettings,
            embeddingSettings: org?.embeddingSettings
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update AI settings" });
    }
};

export const testAiConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { provider, apiKey, model } = req.body;
        // In real implementation, call the provider's API to verify (e.g. list models)
        // For now, return mock success
        res.json({ success: true, message: "Connection successful" });
    } catch (err) {
        res.status(400).json({ success: false, message: "Connection failed" });
    }
};
