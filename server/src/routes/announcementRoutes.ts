// src/routes/announcementRoutes.ts
import express from "express";
import { createAnnouncement } from "../controllers/announcementController";

const router = express.Router();

// POST /api/announcements
router.post("/", createAnnouncement);

export default router;
