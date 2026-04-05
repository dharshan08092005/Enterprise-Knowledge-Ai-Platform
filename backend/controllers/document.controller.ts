import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { logAudit } from "../utils/auditLogger";
import { JOB_TYPES } from "../constants/jobTypes";
import Job from "../models/Job";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { deleteChunksFromPinecone } from "../services/vectorDb/pineconeService";
import fs from "fs";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../middleware/upload";

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, accessScope } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const ownerId = req.user!.userId;
    const organizationId = req.user!.organizationId;
    const departmentId = req.user!.departmentId;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const filePath = (file as any).location || file.path;
    const s3Key = (file as any).key || null;

    // 0️⃣ Check for previous versions to increment version number
    const latestVersion = await Document.findOne({ 
      organizationId, 
      fileName: file.originalname 
    }).sort({ version: -1 });

    const newVersion = latestVersion ? latestVersion.version + 1 : 1;

    // 1️⃣ Create document metadata
    const document = await Document.create({
      title,
      ownerId,
      organizationId,
      departmentId,
      fileName: file.originalname,
      filePath,
      s3Key,
      mimeType: file.mimetype,
      size: file.size,
      accessScope: accessScope || "public",
      status: "uploaded",
      version: newVersion
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
    
    // 🧹 Clean up Pinecone vectors
    try {
      await deleteChunksFromPinecone(id as string);
    } catch (err: any) {
      console.error(`⚠️ Failed to delete vectors for ${id} from Pinecone:`, err.message);
      // We don't fail the request here as the metadata is already gone
    }

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

export const updateDocumentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, userId, organizationId } = req.user!;

    if (!organizationId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["active", "deactivated"].includes(status)) {
        return res.status(400).json({ message: "Invalid status toggle. Only 'active' or 'deactivated' allowed." });
    }

    const document = await Document.findOne({ _id: id, organizationId });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Ownership/Admin check
    if (role !== "ADMIN" && role !== "ORG_ADMIN" && document.ownerId?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const oldStatus = document.status;
    document.status = status;
    await document.save();

    // 🔄 SYNC WITH PINECONE
    if (status === "deactivated") {
        // Remove vectors so AI can't see them
        await deleteChunksFromPinecone(id as string);
        console.log(`❄️ Deactivated knowledge: ${document.title}`);
    } else if (status === "active" && oldStatus !== "active") {
        // If reactivating from anything else, we need to re-index
        const job = await Job.create({
            type: JOB_TYPES.DOCUMENT_PROCESSING,
            documentId: document._id,
            payload: {
                filePath: document.filePath,
                mimeType: document.mimeType
            }
        });
        console.log(`🔥 Reactivating knowledge (Re-indexing): ${document.title}`);
    }

    await logAudit({
      userId: userId,
      organizationId,
      action: "DOCUMENT_STATUS_UPDATED",
      resourceType: "document",
      resourceId: id as string,
      metadata: { from: oldStatus, to: status }
    });

    res.json({ message: `Document status updated to ${status}`, status });

  } catch (err: any) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const viewDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId, organizationId, departmentId } = req.user!;

    if (!organizationId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const document = await Document.findOne({ _id: id, organizationId });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // 🛡️ RE-ENFORCE ACCESS CONTROL (Mirroring chat search logic)
    const isOwner = document.ownerId?.toString() === userId;
    const isAdmin = role === "ADMIN" || role === "ORG_ADMIN";
    const sameDepartment = departmentId && document.departmentId?.toString() === departmentId;

    let hasAccess = false;
    if (isAdmin || isOwner) {
        hasAccess = true;
    } else if (document.accessScope === "public" || document.accessScope === "organization") {
        hasAccess = true;
    } else if (document.accessScope === "department" && sameDepartment) {
        hasAccess = true;
    }

    if (!hasAccess) {
        return res.status(403).json({ message: "Permission denied for this document." });
    }

    // 📝 LOG VIEW AUDIT
    await logAudit({
        userId,
        organizationId,
        action: "DOCUMENT_VIEWED",
        resourceType: "document",
        resourceId: id as string,
        metadata: { title: document.title }
    });

    // 🚀 STREAM CONTENT
    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);

    if (document.s3Key) {
        // Stream from AWS S3
        const getObjectParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME as string,
            Key: document.s3Key
        };
        const response = await s3.send(new GetObjectCommand(getObjectParams));
        (response.Body as any).pipe(res);
    } else if (document.filePath) {
        // Stream from Local Path
        const fullPath = path.resolve(document.filePath);
        if (fs.existsSync(fullPath)) {
            const fileStream = fs.createReadStream(fullPath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ message: "File not found on server." });
        }
    } else {
        res.status(400).json({ message: "Invalid file location." });
    }

  } catch (err: any) {
    console.error("View document error:", err);
    if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream document." });
    }
  }
};