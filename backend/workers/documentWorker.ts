import "dotenv/config";
import http from "http";
import mongoose from "mongoose";

const PORT = process.env.OLLAMA_PORT || process.env.PORT || 8001;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Worker is Running");
}).listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

import Job from "../models/Job";
import Document from "../models/Document";
import DocumentText from "../models/DocumentText";
import DocumentChunk from "../models/DocumentChunk";
import Organization from "../models/Organization";

import { JOB_TYPES } from "../constants/jobTypes";
import { AUDIT_ACTIONS } from "../constants/auditActions";
import { logAudit } from "../utils/auditLogger";

import { extractPdfText } from "../services/extraction/pdfExtractor";
import { chunkText } from "../services/chunking/chunker";
import { generateEmbeddingsBatch } from "../services/embeddings/ollamaEmbedder";
import { upsertChunksToPinecone, deleteChunksFromPinecone } from "../services/vectorDb/pineconeService";

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

    // Update document status to processing
    await Document.findByIdAndUpdate(job.documentId, { $set: { status: "processing" } });

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

    const org = await Organization.findById(document.organizationId).select("+embeddingSettings.apiKey").lean();
    const embSettings = org?.embeddingSettings;
    const modelName = embSettings?.model || "nomic-embed-text";

    if (document.mimeType !== "application/pdf") {
      throw new Error("Unsupported file type");
    }

    /* ---------------------------
       EXTRACTION
    --------------------------- */

    job.stage = "extraction";
    await job.save();

    let fileData: string | Buffer;

    if (document.s3Key) {
      console.log(`☁️ Fetching PDF stream natively from AWS S3: ${document.s3Key}`);
      const { s3 } = await import("../middleware/upload");
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      
      const getObjectParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: document.s3Key
      };
      const response = await s3.send(new GetObjectCommand(getObjectParams));
      const arrayBuffer = await response.Body?.transformToByteArray();
      if (!arrayBuffer) throw new Error("Failed to read S3 bucket payload.");
      fileData = Buffer.from(arrayBuffer);
    } else {
      console.log(`📁 Processing local file: ${document.filePath}`);
      fileData = document.filePath;
    }

    const { text, pageCount } = await extractPdfText(fileData);

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
      tokenCount: chunk.tokenCount,
      embeddingStatus: "pending",
      embeddingModel: modelName
    }));

    const insertedChunks = await DocumentChunk.insertMany(chunkDocs);

    /* ---------------------------
       EMBEDDING & VECTOR DB
    --------------------------- */

    job.stage = "embedding";
    await job.save();

    console.log(`🧠 Generating embeddings for ${chunks.length} chunks using ${modelName}`);
    const textsToEmbed = insertedChunks.map(c => c.text);
    const embeddings = await generateEmbeddingsBatch(textsToEmbed, embSettings as any);

    console.log(`💾 Upserting to Pinecone`);
    const pineconeChunks = insertedChunks.map((chunk, index) => ({
      id: chunk._id.toString(),
      text: chunk.text,
      values: embeddings[index]
    }));

    await upsertChunksToPinecone(
      document.organizationId.toString(),
      document._id.toString(),
      document.accessScope || "restricted",
      document.ownerId.toString(),
      document.departmentId ? document.departmentId.toString() : undefined,
      pineconeChunks
    );

    // Update chunks status
    await DocumentChunk.updateMany(
      { documentId: document._id },
      { $set: { embeddingStatus: "embedded" } }
    );

    /* ---------------------------
       UPDATE DOCUMENT
    --------------------------- */

    document.chunkCount = chunks.length;
    document.status = "active";
    document.pageCount = pageCount;
    await document.save();

    /* ---------------------------
       VERSION CONTROL: SUPERSEDE OLD
    --------------------------- */
    console.log(`🧹 Checking for old versions of ${document.fileName} to supersede...`);
    const oldDocs = await Document.find({
        organizationId: document.organizationId,
        fileName: document.fileName,
        _id: { $ne: document._id },
        status: { $in: ["active", "failed", "deactivated"] } // Anything that isn't already superseded or current
    });

    for (const oldDoc of oldDocs) {
        console.log(`♻️ Superseding v${oldDoc.version} with v${document.version}`);
        oldDoc.status = "superseded";
        oldDoc.supersededBy = document._id as any;
        await oldDoc.save();

        // Ensure old chunks are removed from Pinecone AI search
        try {
            await deleteChunksFromPinecone(oldDoc._id.toString());
        } catch (pErr: any) {
            console.error(`⚠️ Failed to purge old version chunks for ${oldDoc._id}:`, pErr.message);
        }
    }

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

      // Update document status to failed
      await Document.findByIdAndUpdate(job.documentId, { $set: { status: "failed" } });

      // 🧹 Cleanup Pinecone if we already sent chunks
      try {
        await deleteChunksFromPinecone(job.documentId.toString());
      } catch (pErr: any) {
        console.error(`⚠️ Failed to cleanup Pinecone for failed job ${job._id}:`, pErr.message);
      }

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