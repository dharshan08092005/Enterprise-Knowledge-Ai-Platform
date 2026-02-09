import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { logAudit } from "../utils/auditLogger";
import { JOB_TYPES } from "../constants/jobTypes";
import Job from "../models/Job";
import { AUDIT_ACTIONS } from "../constants/audiitActions";

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

    // 1️⃣ Create document metadata
    const document = await Document.create({
      title,
      ownerId,
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
    const { role, userId } = req.user!;

    let documents;

    // ADMIN & AUDITOR → see all documents
    if (role === "ADMIN" || role === "AUDITOR") {
      documents = await Document.find();
    }
    // USER → see only own documents
    else {
      documents = await Document.find({ ownerId: userId });
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
    const { role, userId } = req.user!;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // USER ownership check
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

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete document" });
  }
};
