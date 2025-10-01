import { Server, Socket } from "socket.io";
import mongoose from "mongoose";

export function initSocket(io: Server, db: mongoose.Connection) {
  // Handle client connections
  io.on("connection", (socket: Socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  // Setup MongoDB Change Stream for `line_items`
  const lineItemsCollection = db.collection("line_items");
  lineItemsCollection.watch().on("change", (change) => {
    console.log("📢 line_items updated:", change);
    io.emit("lineItemUpdated", change);
  });

  // Setup MongoDB Change Stream for `appointments`
  try {
    const appointmentsCollection = db.collection("appointments");
    appointmentsCollection.watch().on("change", (change) => {
      console.log("📢 appointments updated:", change);
      io.emit("appointmentUpdated", change);
    });
  } catch (err) {
    console.error("Error initializing appointments change stream:", err);
  }

  // Setup MongoDB Change Stream for `unavailabilities`
  try {
    const unavailabilitiesCollection = db.collection("unavailabilities");
    unavailabilitiesCollection.watch().on("change", (change) => {
      console.log("📢 unavailabilities updated:", change);
      io.emit("unavailabilityUpdated", change);
    });
  } catch (err) {
    console.error("Error initializing unavailabilities change stream:", err);
  }
}
