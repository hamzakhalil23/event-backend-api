import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { config } from "../lib/config";

dotenv.config();

export interface DecodedToken {
  userId: string;
  role: string;
}

export const decodeToken = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return reject(err); // Reject with the error if verification fails
      }

      resolve(decoded as DecodedToken);
    });
  });
};

export function generateToken(payload: DecodedToken) {
  if (!config.jwt_secret || config.jwt_secret.length <= 0) {
    return null;
  }
  const refreshToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "7d",
  });

  const accessToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "24h",
  });

  return { refreshToken, accessToken };
}
