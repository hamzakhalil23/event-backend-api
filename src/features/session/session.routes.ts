import { Router } from "express";
import {
  createSession,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
} from "./session.controller";
import { authenticateUser, requireRole } from "../../middleware/authorization";

const sessionRouter = Router();

// Public — attendees view the schedule
sessionRouter.get("/", getSessions);
sessionRouter.get("/:id", getSessionById);

// Protected — organisers and admins manage sessions
sessionRouter.post("/", authenticateUser, requireRole(["admin", "organiser"]), createSession);
sessionRouter.put("/:id", authenticateUser, requireRole(["admin", "organiser"]), updateSession);
sessionRouter.delete("/:id", authenticateUser, requireRole(["admin", "organiser"]), deleteSession);

export default sessionRouter;
