import { Router } from "express";
import { createAnnouncement, getAllAnnouncements } from "../controllers/announcementsController";

const router = Router();

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);

export default router;
