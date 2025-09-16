// src/models/Announcements.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  announcement_id: string;
  announcement_title: string;
  announcement_description?: string;
  announcement_date: Date;
}

const AnnouncementSchema: Schema = new Schema<IAnnouncement>({
  announcement_id: { type: String, required: true, unique: true }, // e.g. ANN-001
  announcement_title: { type: String, required: true, maxlength: 100 },
  announcement_description: { type: String, default: null },
  announcement_date: { type: Date, default: Date.now, required: true },
});

// Auto-generate incrementing announcement_id
AnnouncementSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastDoc = await Announcement.findOne().sort({ announcement_date: -1 });

  let nextId = "ANN-1";
  if (lastDoc) {
    const lastId = parseInt(lastDoc.announcement_id.replace("ANN-", ""), 10);
    nextId = `ANN-${lastId + 1}`;
  }

  this.announcement_id = nextId;
  next();
});

export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  AnnouncementSchema,
  "announcements"
);
