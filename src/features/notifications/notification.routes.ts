import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notification.controller";
import { authenticateUser } from "../../middleware/authorization";

const notificationRouter = Router();

notificationRouter.use(authenticateUser);

notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread-count", getUnreadCount);
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.patch("/read-all", markAllAsRead);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
