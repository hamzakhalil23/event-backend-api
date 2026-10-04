import { Router } from "express";
import multer from "multer";
import { uploadFile } from "./upload.controller";
import { authenticateUser, requireRole } from "../../middleware/authorization";

const uploadRouter = Router();

// Store file in memory — controller streams directly to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
    }
  },
});

// Protected — only admins and organisers can upload
uploadRouter.post(
  "/",
  authenticateUser,
  requireRole(["admin", "organiser"]),
  upload.single("file"),
  uploadFile,
);

export default uploadRouter;
