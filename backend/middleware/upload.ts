import multer from "multer";
import path from "path";

/**
 * Storage configuration
 * ---------------------
 * For now: local disk storage.
 * (Later we can switch to S3 / GCS without touching controllers.)
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

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

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
