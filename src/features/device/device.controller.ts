import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export const registerToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, platform } = req.body;
    const userId = req.user!.userId;

    if (!token || !platform) {
      res
        .status(400)
        .json({ success: false, message: "token and platform are required" });
      return;
    }

    if (!["ios", "android"].includes(platform)) {
      res
        .status(400)
        .json({ success: false, message: "platform must be ios or android" });
      return;
    }

    await prisma.deviceToken.upsert({
      where: { token },
      create: { token, platform, userId },
      update: { userId, platform, updatedAt: new Date() },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Device token registration failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to register device token" });
  }
};

export const unregisterToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "token is required" });
      return;
    }

    await prisma.deviceToken.deleteMany({ where: { token } });

    res.json({ success: true });
  } catch (err) {
    console.error("Device token unregistration failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to unregister device token" });
  }
};
