import express from "express";
import { upsertDatesByLineItemId, getDatesByLineItemId } from "../controllers/datesController";

const router = express.Router();

// GET /api/dates/:line_item_id
router.get("/:line_item_id", getDatesByLineItemId);

// PUT /api/dates
router.put("/", upsertDatesByLineItemId);

export default router;