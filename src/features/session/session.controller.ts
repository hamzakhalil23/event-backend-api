import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export async function createSession(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      title,
      location,
      languages,
      startTime,
      endTime,
      description,
      imageUrl,
      capacity,
      addressId,
      speakerId,
      tentId,
    } = req.body;

    if (!title || !location || !languages || !startTime) {
      res.status(400).json({
        success: false,
        error: "title, location, languages and startTime are required",
      });
      return;
    }

    const session = await prisma.session.create({
      data: {
        title,
        location,
        languages,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description: description || null,
        imageUrl: imageUrl || null,
        capacity: capacity ?? null,
        addressId: addressId || null,
        speakerId: speakerId || null,
        tentId: tentId || null,
      },
      include: {
        address: true,
        speaker: true,
        tent: true,
      },
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Create session error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to create session",
    });
  }
}

export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    const { query, language, tentId, speakerId } = req.query;

    const where: any = {};

    if (query) {
      where.OR = [
        {
          title: {
            contains: query as string,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query as string,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: query as string,
            mode: "insensitive",
          },
        },
      ];
    }

    if (language) {
      where.languages = {
        has: language as string,
      };
    }

    if (tentId) {
      where.tentId = tentId as string;
    }

    if (speakerId) {
      where.speakerId = speakerId as string;
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: {
        startTime: "asc",
      },
      include: {
        address: true,
        speaker: true,
        tent: true,
      },
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch sessions",
    });
  }
}

export async function getSessionById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        address: true,
        speaker: true,
        tent: true,
        myList: true,
      },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: "Session not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get session by id error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch session",
    });
  }
}

export async function updateSession(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const existingSession = await prisma.session.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingSession) {
      res.status(404).json({
        success: false,
        error: "Session not found",
      });
      return;
    }

    const {
      title,
      location,
      languages,
      startTime,
      endTime,
      description,
      imageUrl,
      capacity,
      addressId,
      speakerId,
      tentId,
    } = req.body;

    const data: any = {};

    if (title !== undefined) data.title = title;
    if (location !== undefined) data.location = location;
    if (languages !== undefined) data.languages = languages;
    if (startTime !== undefined) data.startTime = new Date(startTime);
    if (endTime !== undefined)
      data.endTime = endTime ? new Date(endTime) : null;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (capacity !== undefined) data.capacity = capacity;
    if (addressId !== undefined) data.addressId = addressId || null;
    if (speakerId !== undefined) data.speakerId = speakerId || null;
    if (tentId !== undefined) data.tentId = tentId || null;

    const session = await prisma.session.update({
      where: {
        id: req.params.id as string,
      },
      data,
      include: {
        address: true,
        speaker: true,
        tent: true,
      },
    });

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Update session error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to update session",
    });
  }
}

export async function deleteSession(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const existingSession = await prisma.session.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingSession) {
      res.status(404).json({
        success: false,
        error: "Session not found",
      });
      return;
    }

    // Remove myList entries first (safety net: migration may not be applied on all envs)
    await prisma.myList.deleteMany({ where: { sessionId: req.params.id as string } });

    await prisma.session.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to delete session",
    });
  }
}
