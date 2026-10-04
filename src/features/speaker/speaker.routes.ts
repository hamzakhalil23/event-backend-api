import { Router } from "express";
import {
  getSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} from "./speaker.controller";
import { authenticateUser, requireRole } from "../../middleware/authorization";

const speakerRouter = Router();

// Public — mobile app can display speaker info
speakerRouter.get("/", getSpeakers);
speakerRouter.get("/:id", getSpeakerById);

// Protected — admins and organisers manage speakers
speakerRouter.post("/", authenticateUser, requireRole(["admin", "organiser"]), createSpeaker);
speakerRouter.put("/:id", authenticateUser, requireRole(["admin", "organiser"]), updateSpeaker);
speakerRouter.delete("/:id", authenticateUser, requireRole(["admin", "organiser"]), deleteSpeaker);

export default speakerRouter;
