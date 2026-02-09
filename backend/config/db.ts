// config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("❌ MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    // Connection options for MongoDB Atlas
    await mongoose.connect(mongoUri, {
      // These options help with SSL/TLS issues
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)");
    console.error("   2. The free tier cluster may have paused - visit MongoDB Atlas to resume");
    console.error("   3. Verify your MONGO_URI is correct in .env file\n");
    process.exit(1);
  }
};
