// src/controllers/appointmentsController.ts
import { Request, Response } from "express";
import { Appointment, IAppointment } from "../models/Appointments";
import { IUnavailability } from "../models/Unavailability";
import { cancelAffectedAppointments as cancelAppointmentsService } from "../controllers/appointmentsService";

// Get all approved appointments
export const getApprovedAppointments = async (req: Request, res: Response) => {
  try {
    const approvedAppointments: IAppointment[] = await Appointment.find({
      status: "Approved",
    }).sort({ date_for_inquiry: 1, time_start: 1 });

    return res.status(200).json({ success: true, data: approvedAppointments });
  } catch (error) {
    console.error("Error fetching approved appointments:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all pending appointments
export const getPendingAppointments = async (req: Request, res: Response) => {
  try {
    const pendingAppointments: IAppointment[] = await Appointment.find({
      status: "Pending",
    }).sort({ date_for_inquiry: 1, time_start: 1 });

    return res.status(200).json({ success: true, data: pendingAppointments });
  } catch (error) {
    console.error("Error fetching pending appointments:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Controller wrapper for cancelling affected appointments
export const cancelAffectedAppointmentsController = async (req: Request, res: Response) => {
  try {
    const unavailability: IUnavailability = req.body; // expect JSON with date_unavailable, type, time_start?, time_end?
    await cancelAppointmentsService(unavailability);

    return res.status(200).json({
      success: true,
      message: `Cancelled appointments affected by unavailability on ${unavailability.date_unavailable}`,
    });
  } catch (error) {
    console.error("Error cancelling affected appointments:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update appointment status (approve/cancel)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.body as { status?: string };

    if (!appointment_id) {
      return res.status(400).json({ success: false, message: "appointment_id is required" });
    }

    if (!status || !["Pending", "Cancelled", "Approved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid or missing status" });
    }

    const updated: IAppointment | null = await Appointment.findOneAndUpdate(
      { appointment_id },
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
