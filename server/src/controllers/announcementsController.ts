import { Request, Response } from "express";
import { Announcement } from "../models/Announcements";

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { announcement_title, announcement_description } = req.body;

    if (!announcement_title || !announcement_description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    let announcement;
    let saved = false;
    let retries = 3; // try a few times if conflict happens

    while (!saved && retries > 0) {
      // Find the latest by announcement_id
      const lastAnnouncement = await Announcement.findOne().sort({ announcement_id: -1 });

      let nextIdNumber = 1;
      if (lastAnnouncement) {
        const lastNumber = parseInt(lastAnnouncement.announcement_id.replace("ANN-", ""), 10);
        nextIdNumber = lastNumber + 1;
      }

      const announcement_id = `ANN-${nextIdNumber}`;

      announcement = new Announcement({
        announcement_id,
        announcement_title,
        announcement_description,
      });

      try {
        await announcement.save();
        saved = true; // success
      } catch (err: any) {
        if (err.code === 11000) {
          // Duplicate key (race condition) → retry with next number
          retries--;
          continue;
        }
        throw err;
      }
    }

    if (!saved) {
      return res.status(500).json({ message: "Failed to create announcement after retries" });
    }

    return res.status(201).json({ announcement });
  } catch (err: any) {
    console.error("Error creating announcement:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ announcement_date: -1 }); // newest first
    return res.status(200).json({ announcements });
  } catch (err: any) {
    console.error("Error fetching announcements:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
