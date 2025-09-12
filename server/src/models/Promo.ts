/// src/models/Promo.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPromo extends Document {
  promo_id: string; // PROMO-001 style
  promo_title: string;
  promo_description?: string;
  promo_duration: string; // e.g., "Jan 1-3 2025, Jan 6-10 2025"
}

const PromoSchema: Schema = new Schema<IPromo>(
  {
    promo_id: { type: String, required: true, unique: true }, // e.g., PROMO-001
    promo_title: { type: String, required: true, maxlength: 100 },
    promo_description: { type: String, default: null },
    promo_duration: { type: String, required: true, maxlength: 255 },
  }
  // no timestamps
);

export const Promo = mongoose.model<IPromo>(
  "Promo",
  PromoSchema,
  "promos"
);
