import mongoose from "mongoose";
import dotenv from "dotenv";

import Job from "../models/Job";
import Document from "../models/Document";
import DocumentText from "../models/DocumentText";
import DocumentChunk from "../models/DocumentChunk";

import { JOB_TYPES } from "../constants/jobTypes";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { logAudit } from "../utils/auditLogger";

import { extractPdfText } from "../services/extraction/pdfExtractor";
import { chunkText } from "../services/chunking/chunker";

dotenv.config();

let isConnected = false;

/* ================================
   DATABASE CONNECTION
================================ */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("📦 Worker connected to MongoDB");

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
      isConnected = false;
    });

  } catch (err: any) {
    console.error("❌ DB connection failed:", err.message);
    isConnected = false;
    setTimeout(connectDB, 5000);
  }
};

/* ================================
   JOB PROCESSING
================================ */

const processJob = async (job: any) => {
  try {
    console.log(`⚙️ Processing job ${job._id}`);

    // Mark job processing
    job.status = "PROCESSING";
    job.stage = "initializing";
    await job.save();

    await logAudit({
      action: AUDIT_ACTIONS.JOB_STARTED,
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: job.documentId.toString(),
        attempt: job.attempts + 1
      }
    });

    /* ---------------------------
       FETCH DOCUMENT
    --------------------------- */

    const document = await Document.findById(job.documentId);

    if (!document) throw new Error("Document not found");

    if (document.mimeType !== "application/pdf") {
      throw new Error("Unsupported file type");
    }

    /* ---------------------------
       EXTRACTION
    --------------------------- */

    job.stage = "extraction";
    await job.save();

    const { text, pageCount } = await extractPdfText(document.filePath);

    if (!text || text.length < 20) {
      throw new Error("Extracted text too short");
    }

    console.log(`📄 Extracted ${text.length} characters`);

    await DocumentText.create({
      documentId: document._id,
      text,
      pageCount
    });

    /* ---------------------------
       CHUNKING
    --------------------------- */

    job.stage = "chunking";
    await job.save();

    const chunks = chunkText(text);

    if (!chunks.length) {
      throw new Error("Chunking produced no chunks");
    }

    await DocumentChunk.deleteMany({ documentId: document._id });

    const chunkDocs = chunks.map((chunk, index) => ({
      documentId: document._id,
      chunkIndex: index,
      text: chunk.text,
      tokenCount: chunk.tokenCount
    }));

    await DocumentChunk.insertMany(chunkDocs);

    /* ---------------------------
       UPDATE DOCUMENT
    --------------------------- */

    document.chunkCount = chunks.length;
    document.status = "active";
    document.pageCount = pageCount;
    await document.save();

    /* ---------------------------
       COMPLETE JOB
    --------------------------- */

    job.status = "COMPLETED";
    job.stage = "completed";
    await job.save();

    await logAudit({
      action: AUDIT_ACTIONS.JOB_COMPLETED,
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: job.documentId.toString()
      }
    });

    console.log(`✅ Job ${job._id} completed`);

  } catch (err: any) {

    console.error(`❌ Job ${job._id} failed:`, err.message);

    // Increment attempts ONLY here
    job.attempts += 1;

    if (job.attempts >= job.maxAttempts) {
      job.status = "DEAD";
      job.error = err.message;

      await logAudit({
        action: AUDIT_ACTIONS.JOB_FAILED,
        resourceType: "job",
        resourceId: job._id.toString(),
        metadata: {
          documentId: job.documentId.toString(),
          error: err.message
        }
      });

      console.error(`☠️ Job ${job._id} moved to DEAD state`);
    } else {

      const baseDelayMs = 2000;
      const delay = baseDelayMs * Math.pow(2, job.attempts);

      job.status = "PENDING";
      job.nextRunAt = new Date(Date.now() + delay);
      job.error = err.message;

      await logAudit({
        action: AUDIT_ACTIONS.JOB_RETRY_SCHEDULED,
        resourceType: "job",
        resourceId: job._id.toString(),
        metadata: {
          documentId: job.documentId.toString(),
          nextRunAt: job.nextRunAt,
          attempt: job.attempts
        }
      });

      console.log(`🔁 Retrying in ${delay / 1000}s`);
    }

    await job.save();
  }
};

/* ================================
   POLLING LOOP
================================ */

const pollJobs = async () => {
  if (!isConnected) {
    console.log("⏳ Waiting for DB connection...");
    return;
  }

  try {
    const now = new Date();

    const job = await Job.findOneAndUpdate(
      {
        type: JOB_TYPES.DOCUMENT_PROCESSING,
        status: "PENDING",
        nextRunAt: { $lte: now }
      },
      { status: "PROCESSING" },
      {
        new: true,
        sort: { createdAt: 1 } // ensures FIFO processing
      }
    );

    if (job) {
      await processJob(job);
    }

  } catch (err: any) {
    console.error("❌ Polling error:", err.message);

    if (
      err.name === "MongoNetworkError" ||
      err.message.includes("ECONNRESET")
    ) {
      isConnected = false;
      setTimeout(connectDB, 2000);
    }
  }
};

/* ================================
   START WORKER
================================ */

const startWorker = async () => {
  await connectDB();
  console.log("🧵 Document worker started");
  setInterval(pollJobs, 2000);
};

/* ================================
   GRACEFUL SHUTDOWN
================================ */

process.on("SIGINT", async () => {
  console.log("\n🛑 Worker shutting down...");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Worker shutting down...");
  await mongoose.disconnect();
  process.exit(0);
});

startWorker();