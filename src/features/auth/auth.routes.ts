import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  requestPasswordChange,
  resetPassword,
} from "./auth.controller";

const authRouter = Router();

// Implement login logic using email and password, issue refresh and access tokens
authRouter.post("/login", login);

// Implement refresh token strategy
authRouter.post("/refresh-token", refreshToken);

// Implement logout, retire jwt tokens
authRouter.post("/logout", logout);

authRouter.post("/request-password-change", requestPasswordChange);

authRouter.post("/reset-password", resetPassword);

export default authRouter;
