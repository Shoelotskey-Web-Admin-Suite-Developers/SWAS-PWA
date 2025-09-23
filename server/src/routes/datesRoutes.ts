import express from "express";
import { upsertDatesByLineItemId } from "../controllers/datesController";

const router = express.Router();

// PUT /api/dates
router.put("/", upsertDatesByLineItemId);

export default router;