import express from "express";
import {
  getApprovedAppointments,
  getPendingAppointments,
  cancelAffectedAppointmentsController,
} from "../controllers/appointmentsController";

const router = express.Router();

router.get("/approved", getApprovedAppointments);
router.get("/pending", getPendingAppointments);

// Use the controller wrapper for cancelling affected appointments
router.post("/cancel-affected", cancelAffectedAppointmentsController);

export default router;
