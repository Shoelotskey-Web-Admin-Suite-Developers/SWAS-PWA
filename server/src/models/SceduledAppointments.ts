/// src/models/ScheduledAppointments.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledAppointment extends Document {
  appointment_id: string; // APT-001 style
  date: Date;
  time_block: string; // e.g., "09:00-12:00"
  customer_id: string; // FK -> Customer
}

const ScheduledAppointmentSchema: Schema = new Schema<IScheduledAppointment>(
  {
    appointment_id: { type: String, required: true, unique: true }, // e.g., APT-001
    date: { type: Date, required: true },
    time_block: { type: String, required: true },
    customer_id: { type: String, required: true, ref: "Customer" },
  }
);

export const ScheduledAppointment = mongoose.model<IScheduledAppointment>(
  "ScheduledAppointment",
  ScheduledAppointmentSchema,
  "scheduled_appointments"
);
