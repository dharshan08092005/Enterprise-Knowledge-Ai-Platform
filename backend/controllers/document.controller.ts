import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { logAudit } from "../utils/auditLogger";
import { JOB_TYPES } from "../constants/jobTypes";
import Job from "../models/Job";
import { AUDIT_ACTIONS } from "../constants/auditActions";

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const ownerId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // 1️⃣ Create document metadata
    const document = await Document.create({
      title,
      ownerId,
      organizationId,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      status: "uploaded"
    });

    // 2️⃣ Create async processing job
    const job = await Job.create({
      type: JOB_TYPES.DOCUMENT_PROCESSING,
      documentId: document._id,
      payload: {
        filePath: document.filePath,
        mimeType: document.mimeType
      }
    });

    // 🧾 Job created audit (ADD THIS)
    await logAudit({
      userId: ownerId,
      organizationId,
      action: AUDIT_ACTIONS.JOB_CREATED,
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: document._id.toString(),
        jobType: job.type
      }
    });

    // 3️⃣ Audit log for document upload queue
    await logAudit({
      userId: ownerId,
      organizationId,
      action: "DOCUMENT_UPLOAD_QUEUED",
      resourceType: "document",
      resourceId: document._id.toString(),
      metadata: {
        jobId: job._id.toString()
      }
    });

    // 4️⃣ Respond immediately
    res.status(201).json({
      documentId: document._id,
      jobId: job._id,
      status: document.status
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload document" });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { role, userId, organizationId } = req.user!;
    let documents: any[] = [];

    // ORG_ADMIN / AUDITOR / USER (within an org) → see only documents within their organization
    if (organizationId) {
      if (role === "ORG_ADMIN" || role === "ADMIN" || role === "AUDITOR") {
        documents = await Document.find({ organizationId });
      } else {
        documents = await Document.find({ organizationId, ownerId: userId });
      }
    } else {
      // Global Admin (no organizationId) → Cannot see company documents
      documents = [];
    }

    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId, organizationId } = req.user!;

    if (!organizationId) {
      return res.status(403).json({ message: "Global Admins cannot access company documents" });
    }

    const query: any = { _id: id, organizationId };

    const document = await Document.findOne(query);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // USER ownership check within organization
    if (role === "USER" && document.ownerId?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch document" });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId, organizationId } = req.user!;

    if (!organizationId) {
      return res.status(403).json({ message: "Global Admins cannot delete company documents" });
    }

    const query: any = { _id: id, organizationId };

    const document = await Document.findOne(query);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Ownership check for deletion (Allowing ADMIN or OWNER)
    if (role !== "ADMIN" && role !== "ORG_ADMIN" && document.ownerId?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await document.deleteOne();

    await logAudit({
      userId: userId,
      organizationId,
      action: "DOCUMENT_DELETED",
      resourceType: "document",
      resourceId: id as string,
      metadata: {
        title: document.title
      }
    });

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete document" });
  }
};