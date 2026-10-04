import { Router } from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "./announcements.controller";
import { authenticateUser, requireRole } from "../../middleware/authorization";

const announcementRouter = Router();

// Public — attendees see announcements
announcementRouter.get("/", getAnnouncements);

// Protected — admins only
announcementRouter.post("/", authenticateUser, requireRole(["admin"]), createAnnouncement);
announcementRouter.delete("/:id", authenticateUser, requireRole(["admin"]), deleteAnnouncement);

export default announcementRouter;
