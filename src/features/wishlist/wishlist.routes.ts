import { Router } from "express";
import {
  createWishlist,
  getWishlistsByUser,
  getWishlistById,
  deleteWishlist,
} from "./wishlist.controller";
import { authenticateUser } from "../../middleware/authorization";

const wishlistRouter = Router();

wishlistRouter.use(authenticateUser);

wishlistRouter.post("/", createWishlist);
wishlistRouter.get("/user/:userId", getWishlistsByUser);
wishlistRouter.get("/:userId/:sessionId", getWishlistById);
wishlistRouter.delete("/:userId/:sessionId", deleteWishlist);

export default wishlistRouter;
