import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job";
import Document from "../models/Document";
import { JOB_TYPES } from "../constants/jobTypes";
import { logAudit } from "../utils/auditLogger";
import { AUDIT_ACTIONS } from "../constants/audiitActions";

dotenv.config();

let isConnected = false;

/**
 * Connect to DB with retry logic (workers are independent processes)
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("📦 Worker connected to MongoDB");

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected. Attempting to reconnect...");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
      isConnected = false;
    });

  } catch (err: any) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

/**
 * Process a single job
 */
const processJob = async (job: any) => {
  try {
    console.log(`⚙️ Processing job ${job._id}`);

    // 1️⃣ Mark job as PROCESSING
    job.status = "PROCESSING";
    job.attempts += 1;
    await job.save();

    // 🧾 Audit: job started
    await logAudit({
      action: AUDIT_ACTIONS.JOB_STARTED,
      resourceType: "job",
      resourceId: job._id.toString(),
      metadata: {
        documentId: job.documentId.toString(),
        attempt: job.attempts
      }
    });

    // 2️⃣ Simulate heavy work (placeholder)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 3️⃣ Update document status
    await Document.findByIdAndUpdate(job.documentId, {
      status: "active"
    });

    // 4️⃣ Mark job as COMPLETED
    job.status = "COMPLETED";
    await job.save();

    // 🧾 Audit: job completed
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
    console.error(`❌ Job ${job._id} failed`, err.message);

    job.attempts += 1;

    if (job.attempts >= job.maxAttempts) {
      // ❌ Permanent failure
      job.status = "DEAD";
      job.error = err.message;

      console.error(
        `☠️ Job ${job._id} moved to DEAD state after ${job.attempts} attempts`
      );

      // 🧾 Audit: job failed
      await logAudit({
        action: AUDIT_ACTIONS.JOB_FAILED,
        resourceType: "job",
        resourceId: job._id.toString(),
        metadata: {
          documentId: job.documentId.toString(),
          error: err.message
        }
      });
    } else {
      // 🔁 Retry with exponential backoff
      const baseDelayMs = 2000;
      const delay = baseDelayMs * Math.pow(2, job.attempts);

      job.status = "PENDING";
      job.nextRunAt = new Date(Date.now() + delay);
      job.error = err.message;

      console.log(
        `🔁 Retrying job ${job._id} in ${delay / 1000}s`
      );

      // 🧾 Audit: retry scheduled
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
    }

    await job.save();
  }
};


/**
 * Polling loop with error handling
 */
const pollJobs = async () => {
  // Skip polling if not connected
  if (!isConnected) {
    console.log("⏳ Waiting for MongoDB connection...");
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
      {
        status: "PROCESSING"
      },
      {
        new: true
      }
    );

    if (job) {
      await processJob(job);
    }
  } catch (err: any) {
    console.error("❌ Error polling jobs:", err.message);

    // Check if it's a connection error
    if (err.name === "MongoNetworkError" || err.message.includes("ECONNRESET")) {
      console.log("🔄 Connection lost, attempting to reconnect...");
      isConnected = false;

      // Try to reconnect
      try {
        await mongoose.disconnect();
      } catch (disconnectErr) {
        // Ignore disconnect errors
      }

      // Reconnect after a short delay
      setTimeout(connectDB, 2000);
    }
  }
};


/**
 * Worker start
 */
const startWorker = async () => {
  await connectDB();

  console.log("🧵 Document worker started");

  // Use setInterval for polling
  setInterval(pollJobs, 2000); // poll every 2 seconds
};

// Handle process termination gracefully
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down worker...");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down worker...");
  await mongoose.disconnect();
  process.exit(0);
});

startWorker();

