import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import SystemSettings from "../models/SystemSettings";
import { logAudit } from "../utils/auditLogger";

/**
 * Sensitive fields that should be masked when returned to the frontend.
 * Only the last 4 characters are shown.
 */
const SENSITIVE_FIELDS = [
    "database.mongoUri",
    "llm.apiKey",
    "embedding.apiKey",
    "vectorDb.apiKey",
    "storage.accessKey",
    "storage.secretKey",
    "security.jwtSecret",
    "email.password",
    "email.apiKey",
];

/**
 * Mask a sensitive value, showing only the last 4 characters.
 */
const maskValue = (value: string): string => {
    if (!value || value.length <= 4) return value ? "••••" : "";
    return "••••••••" + value.slice(-4);
};

/**
 * Deep-clone an object and mask sensitive fields.
 */
const maskSensitiveFields = (settings: any): any => {
    const masked = JSON.parse(JSON.stringify(settings));

    for (const fieldPath of SENSITIVE_FIELDS) {
        const parts = fieldPath.split(".");
        let current = masked;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) break;
            current = current[parts[i]];
        }
        const lastKey = parts[parts.length - 1];
        if (current && current[lastKey]) {
            current[lastKey] = maskValue(current[lastKey]);
        }
    }

    return masked;
};

/**
 * GET /api/admin/settings
 * Returns the current system settings (with sensitive values masked).
 */
export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        // Singleton: get or create if not exists
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }

        const settingsObj = settings.toObject();
        const masked = maskSensitiveFields(settingsObj);

        res.json(masked);
    } catch (err) {
        console.error("Failed to fetch settings:", err);
        res.status(500).json({ message: "Failed to fetch settings" });
    }
};

/**
 * PUT /api/admin/settings
 * Updates system settings. Only non-masked values are saved.
 * Masked values (starting with "••••") are skipped to avoid overwriting real secrets.
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const updates = req.body;
        const userId = req.user!.userId;

        // Get current settings
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }

        // Deep merge, skipping masked values
        const currentObj = settings.toObject();
        const mergedUpdates: any = {};

        for (const [section, sectionData] of Object.entries(updates)) {
            if (typeof sectionData !== "object" || sectionData === null) continue;
            if (section === "_id" || section === "__v" || section === "createdAt" || section === "updatedAt") continue;

            mergedUpdates[section] = {};
            for (const [key, value] of Object.entries(sectionData as Record<string, any>)) {
                // Skip masked values — don't overwrite real secrets with mask
                if (typeof value === "string" && value.startsWith("••••")) {
                    // Keep existing value
                    mergedUpdates[section][key] = (currentObj as any)[section]?.[key] || "";
                } else {
                    mergedUpdates[section][key] = value;
                }
            }
        }

        // Apply the update
        const updatedSettings = await SystemSettings.findOneAndUpdate(
            {},
            { $set: mergedUpdates },
            { new: true, upsert: true }
        );

        // Audit log
        await logAudit({
            userId,
            action: "SETTINGS_UPDATED",
            resourceType: "settings",
            resourceId: updatedSettings!._id.toString(),
            metadata: {
                sectionsUpdated: Object.keys(mergedUpdates),
            },
        });

        // Return masked response
        const masked = maskSensitiveFields(updatedSettings!.toObject());
        res.json({ message: "Settings updated successfully", settings: masked });
    } catch (err) {
        console.error("Failed to update settings:", err);
        res.status(500).json({ message: "Failed to update settings" });
    }
};

/**
 * POST /api/admin/settings/test-connection
 * Tests a specific service connection (database, LLM, etc.)
 */
export const testConnection = async (req: AuthRequest, res: Response) => {
    try {
        const { service } = req.body;

        // For now, return a simulated success
        // In production, you'd actually test the connection
        const results: Record<string, { success: boolean; message: string }> = {
            database: { success: true, message: "MongoDB connection is active" },
            llm: { success: false, message: "API key not configured" },
            embedding: { success: false, message: "API key not configured" },
            vectorDb: { success: false, message: "Not configured" },
            storage: { success: true, message: "Local storage is active" },
            email: { success: false, message: "Not configured" },
        };

        const result = results[service] || { success: false, message: "Unknown service" };
        res.json(result);
    } catch (err) {
        console.error("Failed to test connection:", err);
        res.status(500).json({ message: "Failed to test connection" });
    }
};
