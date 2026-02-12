import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";

export const getKnowledgeBase = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { role, userId } = req.user!;
    const isAdmin = role === "ADMIN";

    let query: any = {};

    // USER: only own documents
    if (role === "USER") {
      query.ownerId = userId;
    }

    // Build the query with relevant fields
    let dbQuery = Document.find(query)
      .select("_id title fileName size mimeType accessScope status createdAt ownerId")
      .sort({ createdAt: -1 });

    // Populate owner details for admin users
    if (isAdmin) {
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
      owner: isAdmin && doc.ownerId ? {
        id: doc.ownerId._id?.toString() || doc.ownerId.toString(),
        name: doc.ownerId.name || "Unknown",
        email: doc.ownerId.email || ""
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
