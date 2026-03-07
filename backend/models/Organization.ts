import { Schema, model, Document } from "mongoose";

interface IOrganization extends Document {
    name: string;
    slug: string; // unique identifier for URLs etc.
    domain?: string; // e.g. "acme.com"
    isActive: boolean;
    maxUsers: number;
    subscriptionPlan: "free" | "pro" | "enterprise";
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
        }
    },
    { timestamps: true }
);

export default model<IOrganization>("Organization", organizationSchema);
