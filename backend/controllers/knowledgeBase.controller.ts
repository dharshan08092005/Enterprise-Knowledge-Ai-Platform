import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { applyScopeFilter } from "../utils/scopeFilter";

export const getKnowledgeBase = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      roleName,
      userId,
      organizationId,
      departmentId
    } = req.user!;

    let query: any = {
      status: "active" // Only processed documents
    };

    const filter = applyScopeFilter(req, {}, {
      ownerField: "ownerId",
      organizationField: "organizationId",
      departmentField: "departmentId"
    });

    if (!filter) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const documents = await Document.find(filter)
      .select(
        "_id title fileName size mimeType accessScope status createdAt ownerId"
      )
      .sort({ createdAt: -1 })
      .populate("ownerId", "name email");

    const transformedDocs = documents.map((doc: any) => ({
      id: doc._id.toString(),
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.size,
      mimeType: doc.mimeType,
      accessScope: doc.accessScope,
      status: doc.status,
      uploadDate: doc.createdAt,
      owner: doc.ownerId
        ? {
            id: doc.ownerId._id.toString(),
            name: doc.ownerId.name,
            email: doc.ownerId.email
          }
        : undefined
    }));

    res.json(transformedDocs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch knowledge base"
    });
  }
};
