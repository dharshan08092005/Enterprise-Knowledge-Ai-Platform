import { Schema, model, Types, Document } from "mongoose";

interface IDepartment extends Document {
    name: string;
    organizationId: Types.ObjectId;
    description?: string;
}

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },
        description: {
            type: String
        }
    },
    { timestamps: true }
);

// Ensure department names are unique per organization
departmentSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default model<IDepartment>("Department", departmentSchema);
