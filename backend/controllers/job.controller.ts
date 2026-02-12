import { Response } from "express";
import Job from "../models/Job";
import Document from "../models/Document";
import { AuthRequest } from "../middleware/auth";
import { logAudit } from "../utils/auditLogger";

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ADMIN & AUDITOR can see all jobs
    if (role !== "ADMIN" && role !== "AUDITOR") {
      // USER: must own the related document
      const document = await Document.findById(job.documentId);
      if (!document) {
        return res.status(404).json({ message: "Related document not found" });
      }

      if (document.ownerId.toString() !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    res.json({
      jobId: job._id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      nextRunAt: job.nextRunAt,
      documentId: job.documentId,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch job status" });
  }
};

export const getDeadJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ status: "DEAD" })
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dead jobs" });
  }
};

export const retryDeadJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "DEAD") {
      return res.status(400).json({
        message: "Only DEAD jobs can be retried"
      });
    }

    // 🔁 Reset job safely
    job.status = "PENDING";
    job.attempts = 0;
    job.error = null;
    job.nextRunAt = new Date();

    await job.save();

    // 🧾 Audit admin retry
    await logAudit({
      userId: req.user!.userId,
      action: "JOB_RETRIED_BY_ADMIN",
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: job.documentId.toString()
      }
    });

    res.json({
      message: "Job retried successfully",
      jobId: job._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retry job" });
  }
};

