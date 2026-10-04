import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export const getNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 30;

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Fetch notifications failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ success: true, unreadCount: count });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Mark as read failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Mark all as read failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read" });
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const deleted = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete notification failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};
