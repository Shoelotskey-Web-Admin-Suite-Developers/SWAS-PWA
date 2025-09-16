// src/controllers/announcementController.ts
import { Request, Response } from "express";
import { Announcement } from "../models/Announcements";

// POST: Create announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { announcement_id, announcement_title, announcement_description } = req.body;

    if (!announcement_id || !announcement_title) {
      return res.status(400).json({ error: "announcement_id and announcement_title are required" });
    }

    const newAnnouncement = new Announcement({
      announcement_id,
      announcement_title,
      announcement_description,
      announcement_date: new Date(),
    });

    await newAnnouncement.save();

    res.status(201).json({
      message: "✅ Announcement created successfully",
      announcement: newAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      error: "❌ Failed to create announcement",
      details: error,
    });
  }
};

