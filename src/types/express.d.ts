import { DecodedToken } from "../utils/tokenize";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}
