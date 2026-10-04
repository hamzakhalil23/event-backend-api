import dotenv from "dotenv";

dotenv.config();

export const config = {
  jwt_secret: process.env.JWT_SECRET ?? "",
  port: process.env.PORT ?? 8000,
  salt: process.env.SALT ?? 10,
  node_env: process.env.NODE_ENV ?? "development",
};
