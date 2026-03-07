import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";

export const getKnowledgeBase = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { role, userId, organizationId } = req.user!;

    // Global Admin (no organizationId) → Cannot see company documents
    if (!organizationId) {
      return res.json([]);
    }

    let query: any = { organizationId };

    // USER: only own documents (or those shared in dept - future enhancement)
    if (role === "USER") {
      query.ownerId = userId;
    }

    // Build the query with relevant fields
    let dbQuery = Document.find(query)
      .select("_id title fileName size mimeType accessScope status createdAt ownerId")
      .sort({ createdAt: -1 });

    // Populate owner details for admin/auditor roles
    const shouldPopulate = role === "ADMIN" || role === "ORG_ADMIN" || role === "AUDITOR";
    if (shouldPopulate) {
      dbQuery = dbQuery.populate("ownerId", "name email");
    }

    const documents = await dbQuery;

    // Transform documents for frontend
    const transformedDocs = documents.map((doc: any) => ({
      id: doc._id.toString(),
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.size,
      mimeType: doc.mimeType,
      accessScope: doc.accessScope || "restricted",
      status: doc.status === "uploaded" ? "processing" : doc.status,
      uploadDate: doc.createdAt,
      owner: shouldPopulate && doc.ownerId ? {
        id: (doc.ownerId as any)._id?.toString() || doc.ownerId.toString(),
        name: (doc.ownerId as any).name || "Unknown",
        email: (doc.ownerId as any).email || ""
      } : undefined
    }));

    res.json(transformedDocs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch knowledge base"
    });
  }
};
