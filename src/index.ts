import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

import userRouter from "./features/user/user.routes";
import authRouter from "./features/auth/auth.routes";
import sessionRouter from "./features/session/session.routes";
import tentRouter from "./features/tent/tent.routes";
import wishlistRouter from "./features/wishlist/wishlist.routes";
import announcementRouter from "./features/announcements/announcements.routes";
import deviceRouter from "./features/device/device.routes";
import notificationRouter from "./features/notifications/notification.routes";
import speakerRouter from "./features/speaker/speaker.routes";
import uploadRouter from "./features/upload/upload.routes";

dotenv.config();

const PORT = process.env.PORT!;

async function main() {
  const app = express();

  app.use(
    cors({
      origin: [
        "http://localhost:8081",
        "http://localhost:8001",
        "http://localhost:3000",
      ],
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(compression());
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res
      .status(200)
      .json({ success: true, message: "Service is healthy and running" });
  });

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/session", sessionRouter);
  app.use("/tent", tentRouter);
  app.use("/wishlist", wishlistRouter);
  app.use("/announcement", announcementRouter);
  app.use("/device-token", deviceRouter);
  app.use("/notification", notificationRouter);
  app.use("/speaker", speakerRouter);
  app.use("/upload", uploadRouter);

  const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      console.log("Server shut down.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => console.error(e));
