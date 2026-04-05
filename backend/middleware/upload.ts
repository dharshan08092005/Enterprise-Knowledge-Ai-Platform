import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

// Extract AWS credentials from environment
const s3Config = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
};

const s3 = new S3Client(s3Config);

/**
 * File filter (basic safety)
 */
const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

/**
 * Switch to S3 streaming uploads using multer-s3.
 * Instead of saving to disk, it pipes immediately to S3 buffer.
 */
// Provide a robust fallback if AWS keys aren't actually set yet
const isAwsConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME;

const storage = isAwsConfigured 
? multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    metadata: function (req: any, file: any, cb: any) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: any, file: any, cb: any) {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `documents/${uniqueName}${path.extname(file.originalname)}`);
    }
  })
: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    }
  });

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Export S3 client so workers can natively fetch objects back down for parsing
export { s3 };
