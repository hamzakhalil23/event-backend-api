import { Router } from "express";
import {
  createTent,
  deleteTent,
  getTentById,
  getTents,
  updateTent,
} from "./tent.controller";

const tentRouter = Router();

tentRouter.get("/", getTents);
tentRouter.post("/", createTent);
tentRouter.get("/:id", getTentById);
tentRouter.put("/:id", updateTent);
tentRouter.delete("/:id", deleteTent);

export default tentRouter;
