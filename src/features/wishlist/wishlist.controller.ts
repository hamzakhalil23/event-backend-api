import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export async function createWishlist(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId, sessionId } = req.body;

    if (!userId || !sessionId) {
      res.status(400).json({
        success: false,
        error: "userId and sessionId are required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: "Session not found",
      });
      return;
    }

    const existingWishlist = await prisma.myList.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (existingWishlist) {
      res.status(409).json({
        success: false,
        error: "Session already exists in user's list",
      });
      return;
    }

    const wishlist = await prisma.myList.create({
      data: {
        userId,
        sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        session: {
          include: {
            speaker: true,
            tent: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Create wishlist error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to add session to wishlist",
    });
  }
}

export async function getWishlistsByUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params.userId as string;

    const wishlists = await prisma.myList.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        session: {
          include: {
            speaker: true,
            tent: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      wishlists,
    });
  } catch (error) {
    console.error("Get wishlists by user error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch user's wishlist",
    });
  }
}

export async function getWishlistById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const sessionId = req.params.sessionId as string;

    const wishlist = await prisma.myList.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        session: {
          include: {
            speaker: true,
            tent: true,
          },
        },
      },
    });

    if (!wishlist) {
      res.status(404).json({
        success: false,
        error: "Wishlist item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist by id error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch wishlist item",
    });
  }
}

export async function updateWishlist(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(405).json({
    success: false,
    error: "Wishlist items cannot be updated. Delete and recreate instead.",
  });
}

export async function deleteWishlist(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const sessionId = req.params.sessionId as string;

    const existingWishlist = await prisma.myList.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (!existingWishlist) {
      res.status(404).json({
        success: false,
        error: "Wishlist item not found",
      });
      return;
    }

    await prisma.myList.delete({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Session removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Delete wishlist error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to remove session from wishlist",
    });
  }
}
