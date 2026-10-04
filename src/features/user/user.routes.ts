import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "./user.controller";
import { authenticateUser, requireRole } from "../../middleware/authorization";

const userRouter = Router();

// Public — user registration
userRouter.post("/", createUser);

// Protected — requires authentication
userRouter.get("/", authenticateUser, requireRole(["admin", "organiser"]), getUsers);
userRouter.get("/:id", authenticateUser, getUserById);
userRouter.patch("/:id", authenticateUser, updateUser);
userRouter.delete("/:id", authenticateUser, requireRole(["admin"]), deleteUser);

export default userRouter;
