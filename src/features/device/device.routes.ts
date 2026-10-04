import { Router } from "express";
import { registerToken, unregisterToken } from "./device.controller";
import { authenticateUser } from "../../middleware/authorization";

const deviceRouter = Router();

deviceRouter.use(authenticateUser);

deviceRouter.post("/register", registerToken);
deviceRouter.delete("/unregister", unregisterToken);

export default deviceRouter;
