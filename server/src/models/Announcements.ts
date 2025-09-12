/// src/models/Announcement.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  announcement_id: string; // ANN-001 style
  announcement_title: string;
  announcement_description?: string;
  announcement_date: Date;
}

const AnnouncementSchema: Schema = new Schema<IAnnouncement>(
  {
    announcement_id: { type: String, required: true, unique: true }, // e.g. ANN-001
    announcement_title: { type: String, required: true, maxlength: 100 },
    announcement_description: { type: String, default: null },
    announcement_date: { type: Date, default: Date.now, required: true },
  }
);

export const Announcement = mongoose.model<IAnnouncement>("Announcement",AnnouncementSchema,"announcements");
