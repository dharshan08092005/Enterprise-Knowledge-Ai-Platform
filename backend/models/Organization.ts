import { Schema, model, Document } from "mongoose";

interface IOrganization extends Document {
    name: string;
    slug: string; // unique identifier for URLs etc.
    domain?: string; // e.g. "acme.com"
    isActive: boolean;
    maxUsers: number;
    subscriptionPlan: "free" | "pro" | "enterprise";
    aiSettings?: {
        provider: string;
        apiKey?: string;
        model?: string;
    };
    embeddingSettings?: {
        provider: string;
        apiKey?: string;
        model?: string;
    };
    themeColor?: string;
}

const organizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        domain: {
            type: String,
            lowercase: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        maxUsers: {
            type: Number,
            default: 10
        },
        subscriptionPlan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free"
        },
        aiSettings: {
            provider: { type: String, default: 'google' },
            apiKey: { type: String, select: false }, // Only returned when explicitly requested for security
            model: { type: String, default: 'gemini-1.5-flash' }
        },
        embeddingSettings: {
            provider: { type: String, default: 'ollama' },
            apiKey: { type: String, select: false },
            model: { type: String, default: 'nomic-embed-text' }
        },
        themeColor: {
            type: String,
            default: "#2563eb"
        }
    },
    { timestamps: true }
);

export default model<IOrganization>("Organization", organizationSchema);
