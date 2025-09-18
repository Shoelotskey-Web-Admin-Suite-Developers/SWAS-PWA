import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth";
import announcementRoutes from "./routes/announcementsRoutes"; // 👈 add this
import branchRoutes from "./routes/branchRoutes";
import userRoutes from "./routes/userRoutes";
import customerRoutes from "./routes/customerRoutes";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/announcements", announcementRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api", userRoutes);
app.use("/api/customers", customerRoutes);

// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Auth routes
app.use("/api/auth", authRoutes);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
