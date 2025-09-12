/// src/models/Unavailability.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUnavailability extends Document {
  unavailability_id: string; // UNAV-001 style
  date_unavailable: Date;
  type: "Full Day" | "Partial Day";
  time_block?: string; // e.g., "09:00-12:00" (only if Partial Day)
  note?: string; // e.g., "Meeting", "Holiday"
}

const UnavailabilitySchema: Schema = new Schema<IUnavailability>(
  {
    unavailability_id: { type: String, required: true, unique: true }, // e.g., UNAV-001
    date_unavailable: { type: Date, required: true },
    type: { type: String, enum: ["Full Day", "Partial Day"], required: true },
    time_block: { type: String, default: null }, // optional
    note: { type: String, maxlength: 255, default: null }, // optional
  }
);

export const Unavailability = mongoose.model<IUnavailability>(
  "Unavailability",
  UnavailabilitySchema,
  "unavailability"
);
