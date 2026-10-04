import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "eu-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET ?? "ijtema-media";

export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ success: false, error: "No file provided" });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const key = `uploads/${randomUUID()}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION ?? "eu-west-2"}.amazonaws.com/${key}`;

    res.status(201).json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
}
