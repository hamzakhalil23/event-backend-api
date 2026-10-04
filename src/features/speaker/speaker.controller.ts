import { Request, Response } from "express";
import { prisma } from "../../lib/db";

export async function getSpeakers(req: Request, res: Response): Promise<void> {
  try {
    const speakers = await prisma.speaker.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: speakers });
  } catch (error) {
    console.error("Get speakers error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch speakers" });
  }
}

export async function getSpeakerById(req: Request, res: Response): Promise<void> {
  try {
    const speaker = await prisma.speaker.findUnique({
      where: { id: req.params.id as string },
      include: { sessions: true },
    });
    if (!speaker) {
      res.status(404).json({ success: false, error: "Speaker not found" });
      return;
    }
    res.json({ success: true, data: speaker });
  } catch (error) {
    console.error("Get speaker by id error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch speaker" });
  }
}

export async function createSpeaker(req: Request, res: Response): Promise<void> {
  try {
    const { name, bio, imageUrl, title } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: "name is required" });
      return;
    }
    const speaker = await prisma.speaker.create({
      data: {
        name,
        bio: bio || null,
        imageUrl: imageUrl || null,
        title: title || null,
      },
    });
    res.status(201).json({ success: true, data: speaker });
  } catch (error) {
    console.error("Create speaker error:", error);
    res.status(500).json({ success: false, error: "Failed to create speaker" });
  }
}

export async function updateSpeaker(req: Request, res: Response): Promise<void> {
  try {
    const existing = await prisma.speaker.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ success: false, error: "Speaker not found" });
      return;
    }
    const { name, bio, imageUrl, title } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (title !== undefined) data.title = title;

    const speaker = await prisma.speaker.update({ where: { id: req.params.id as string }, data });
    res.json({ success: true, data: speaker });
  } catch (error) {
    console.error("Update speaker error:", error);
    res.status(500).json({ success: false, error: "Failed to update speaker" });
  }
}

export async function deleteSpeaker(req: Request, res: Response): Promise<void> {
  try {
    const existing = await prisma.speaker.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ success: false, error: "Speaker not found" });
      return;
    }
    await prisma.speaker.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Speaker deleted" });
  } catch (error) {
    console.error("Delete speaker error:", error);
    res.status(500).json({ success: false, error: "Failed to delete speaker" });
  }
}
