// src/services/appointmentsService.ts
import { Appointment, IAppointment } from "../models/Appointments";
import { IUnavailability } from "../models/Unavailability";

export const cancelAffectedAppointments = async (unavailability: IUnavailability) => {
  try {
    const dateStr = unavailability.date_unavailable;

    let filter: any = { 
      status: "Approved",
      date_for_inquiry: dateStr
    };

    if (unavailability.type === "Partial Day") {
      // Partial day: filter appointments that overlap with partial hours
      filter.time_start = { $lt: unavailability.time_end };
      filter.time_end = { $gt: unavailability.time_start };
    }

    const affectedAppointments: IAppointment[] = await Appointment.find(filter);

    if (affectedAppointments.length === 0) return; // nothing to cancel

    const affectedIds = affectedAppointments.map(a => a._id);

    await Appointment.updateMany(
      { _id: { $in: affectedIds } },
      { $set: { status: "Cancelled", cancel_reason: `Cancelled due to unavailability (${unavailability.type})` } }
    );

    console.log(`Cancelled ${affectedAppointments.length} appointment(s) affected by unavailability on ${dateStr}`);
  } catch (err) {
    console.error("Error cancelling affected appointments:", err);
  }
};
