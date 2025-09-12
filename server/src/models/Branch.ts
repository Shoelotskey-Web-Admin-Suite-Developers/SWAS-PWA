/// src/models/Branch.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  branch_id: string; // LOC-<CODE>-<TYPE>, e.g., LOC-VAL-B
  branch_number: number; // auto-increment
  location: string; // e.g., "Valenzuela, NCR"
  branch_code: string; // e.g., VAL, SMV
  type: "H" | "B"; // Hub or Branch
}

const BranchSchema: Schema = new Schema<IBranch>(
  {
    branch_id: { type: String, required: true, unique: true }, // LOC-<CODE>-<TYPE>
    branch_number: { type: Number, required: true, unique: true }, // auto-increment
    location: { type: String, required: true, maxlength: 100 },
    branch_code: { type: String, required: true, unique: true, maxlength: 20 },
    type: { type: String, enum: ["H", "B"], required: true },
  }
  // no timestamps
);

export const Branch = mongoose.model<IBranch>(
  "Branch",
  BranchSchema,
  "branches"
);
