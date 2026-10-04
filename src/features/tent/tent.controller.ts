import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export async function createTent(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: "Tent name is required",
      });
      return;
    }

    const tent = await prisma.tent.create({
      data: {
        name,
      },
      include: {
        pois: true,
        sessions: true,
      },
    });

    res.status(201).json({
      success: true,
      tent,
    });
  } catch (error) {
    console.error("Create tent error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to create tent",
    });
  }
}

export async function getTents(req: Request, res: Response): Promise<void> {
  try {
    const { query } = req.query;

    const where: any = {};

    if (query) {
      where.name = {
        contains: query as string,
        mode: "insensitive",
      };
    }

    const tents = await prisma.tent.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        pois: true,
        sessions: true,
      },
    });

    res.status(200).json({
      success: true,
      tents,
    });
  } catch (error) {
    console.error("Get tents error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch tents",
    });
  }
}

export async function getTentById(req: Request, res: Response): Promise<void> {
  try {
    const tent = await prisma.tent.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        pois: true,
        sessions: true,
      },
    });

    if (!tent) {
      res.status(404).json({
        success: false,
        error: "Tent not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      tent,
    });
  } catch (error) {
    console.error("Get tent by id error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch tent",
    });
  }
}

export async function updateTent(req: Request, res: Response): Promise<void> {
  try {
    const existingTent = await prisma.tent.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingTent) {
      res.status(404).json({
        success: false,
        error: "Tent not found",
      });
      return;
    }

    const { name } = req.body;

    const tent = await prisma.tent.update({
      where: {
        id: req.params.id as string,
      },
      data: {
        ...(name !== undefined && { name }),
      },
      include: {
        pois: true,
        sessions: true,
      },
    });

    res.status(200).json({
      success: true,
      tent,
    });
  } catch (error) {
    console.error("Update tent error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to update tent",
    });
  }
}

export async function deleteTent(req: Request, res: Response): Promise<void> {
  try {
    const existingTent = await prisma.tent.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingTent) {
      res.status(404).json({
        success: false,
        error: "Tent not found",
      });
      return;
    }

    await prisma.tent.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.status(200).json({
      success: true,
      message: "Tent deleted successfully",
    });
  } catch (error) {
    console.error("Delete tent error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to delete tent",
    });
  }
}
