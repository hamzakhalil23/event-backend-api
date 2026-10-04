import { config } from "../lib/config";

export const refreshCookieName = "refreshToken";

export const getCookieOptions = () => {
  const isProduction = config.node_env === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};
