import { Request, Response } from "express";
import {
  sendPushNotifications,
  cleanupStaleTokens,
} from "../../services/push.service";
import { prisma } from "../../lib/db";

export const createAnnouncement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, message, targetLanguage, targetCountry } = req.body;

    if (!title || !message) {
      res
        .status(400)
        .json({ success: false, message: "title and message are required" });
      return;
    }

    const announcement = await prisma.announcements.create({
      data: {
        title,
        message,
        targetLanguage: targetLanguage || "All",
        targetCountry:  targetCountry  || "All",
      },
      select: {
        id:             true,
        title:          true,
        message:        true,
        targetLanguage: true,
        targetCountry:  true,
        createdAt:      true,
        updatedAt:      true,
      },
    });

    // fire in background — don't block the admin response
    broadcastAnnouncement(announcement).catch((err) =>
      console.error("Broadcast failed:", err),
    );

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error("Create announcement failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create announcement" });
  }
};

async function broadcastAnnouncement(announcement: {
  id: string;
  title: string;
  message: string;
  targetLanguage: string;
  targetCountry: string;
}): Promise<void> {
  // Build a filter scoped to the targeting criteria
  const userWhere: any = {};

  if (announcement.targetCountry !== "All") {
    userWhere.address = { country: announcement.targetCountry };
  }

  const sessionWhere: any = {};
  if (announcement.targetLanguage !== "All") {
    sessionWhere.languages = { has: announcement.targetLanguage };
  }
  if (Object.keys(sessionWhere).length > 0) {
    userWhere.myList = { some: { session: sessionWhere } };
  }

  const devices = await prisma.deviceToken.findMany({
    where: Object.keys(userWhere).length > 0 ? { user: userWhere } : {},
    select: { token: true, userId: true },
  });

  if (!devices.length) return;

  // 1. send push notifications
  const pushMessages = devices.map((device) => ({
    to: device.token,
    title: announcement.title,
    body:
      announcement.message.length > 150
        ? announcement.message.substring(0, 147) + "..."
        : announcement.message,
    sound: "default" as const,
    data: {
      type: "announcement",
      announcementId: announcement.id,
    },
  }));

  const tickets = await sendPushNotifications(pushMessages);

  // 2. cleanup stale tokens
  const tokens = devices
    .filter((d) =>
      pushMessages.some((m) => m.to === d.token),
    )
    .map((d) => d.token);

  await cleanupStaleTokens(tickets, tokens);

  // 3. create in-app notification for each unique targeted user
  const uniqueUserIds = [...new Set(devices.map((d) => d.userId))];

  await prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      title: announcement.title,
      body:
        announcement.message.length > 200
          ? announcement.message.substring(0, 197) + "..."
          : announcement.message,
      type: "announcement",
      data: { announcementId: announcement.id },
      userId,
    })),
  });
}

export const getAnnouncements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const announcements = await prisma.announcements.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id:             true,
        title:          true,
        message:        true,
        targetLanguage: true,
        targetCountry:  true,
        createdAt:      true,
        updatedAt:      true,
      },
    });

    res.json({ success: true, data: announcements });
  } catch (err) {
    console.error("Fetch announcements failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch announcements" });
  }
};

export const deleteAnnouncement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.announcements.delete({ where: { id: id as string } });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete announcement failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete announcement" });
  }
};
