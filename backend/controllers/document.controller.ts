import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { logAudit } from "../utils/auditLogger";
import { JOB_TYPES } from "../constants/jobTypes";
import Job from "../models/Job";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { applyScopeFilter } from "../utils/scopeFilter";


// ======================================================
// CREATE DOCUMENT
// ======================================================

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

    const { userId, organizationId, departmentId } = req.user!;

    const document = await Document.create({
      title,
      ownerId: userId,
      organizationId,
      departmentId,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      status: "uploaded"
    });

    const job = await Job.create({
      type: JOB_TYPES.DOCUMENT_PROCESSING,
      documentId: document._id,
      payload: {
        filePath: document.filePath,
        mimeType: document.mimeType
      }
    });

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.JOB_CREATED,
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: document._id.toString()
      }
    });

    await logAudit({
      userId,
      action: "DOCUMENT_UPLOAD_QUEUED",
      resourceType: "document",
      resourceId: document._id.toString(),
      metadata: {
        jobId: job._id.toString()
      }
    });

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



// ======================================================
// GET DOCUMENTS (Scoped)
// ======================================================

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { roleName, userId, organizationId, departmentId } = req.user!;

    const filter = applyScopeFilter(req, {}, {
      ownerField: "ownerId",
      organizationField: "organizationId",
      departmentField: "departmentId"
    });

    const documents = await Document.find(filter);

    res.json(documents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};



// ======================================================
// GET DOCUMENT BY ID (Scoped)
// ======================================================

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roleName, userId, organizationId, departmentId } = req.user!;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Scope check
    const filter = applyScopeFilter(req, {}, {
      ownerField: "ownerId",
      organizationField: "organizationId",
      departmentField: "departmentId"
    });

    if (!filter) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(document);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch document" });
  }
};



// ======================================================
// DELETE DOCUMENT (Scoped + Safe)
// ======================================================

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roleName, userId, organizationId, departmentId } = req.user!;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Scope check (same pattern as above)

    const filter = applyScopeFilter(req, {}, {
      ownerField: "ownerId",
      organizationField: "organizationId",
      departmentField: "departmentId"
    });

    if (!filter) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await document.deleteOne();

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.DOCUMENT_DELETED,
      resourceType: "document",
      resourceId: id as string
    });

    res.json({ message: "Document deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete document" });
  }
};
