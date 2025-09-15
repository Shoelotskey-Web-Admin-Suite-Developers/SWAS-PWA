/// src/models/PendingAppointments.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPendingAppointment extends Document {
  pending_id: string; // PEND-001 style
  cust_id: string; // FK -> Customer
  branch_id: string; // FK -> Branch
  date_for_inquiry: Date;
  time_block: string; // e.g., "09:00-09:30"
  status: "Pending" | "Approved";
}

const PendingAppointmentSchema: Schema = new Schema<IPendingAppointment>(
  {
    pending_id: { type: String, required: true, unique: true }, // e.g., PEND-001
    cust_id: { type: String, required: true, ref: "Customer" },
    branch_id: { type: String, required: true, ref: "Branch" },
    date_for_inquiry: { type: Date, required: true },
    time_block: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
      required: true,
    },
  }
);

export const PendingAppointment = mongoose.model<IPendingAppointment>(
  "PendingAppointment",
  PendingAppointmentSchema,
  "pending_appointments"
);
