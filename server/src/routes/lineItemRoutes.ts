// src/routes/lineItemRoutes.ts
import { Router } from "express";
import { getLineItemsByStatus, updateLineItemStatus } from "../controllers/lineItemController";

const router = Router();

router.get("/status/:status", getLineItemsByStatus);
router.put("/status", updateLineItemStatus); // new route for updating status

export default router;
