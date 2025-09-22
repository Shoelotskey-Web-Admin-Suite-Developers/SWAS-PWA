// src/routes/lineItemRoutes.ts
import { Router } from "express";
import { getLineItemsByStatus, updateLineItemStatus, getAllLineItems, updateLineItemImage } from "../controllers/lineItemController";

const router = Router();

router.get("/status/:status", getLineItemsByStatus);
router.get("/", getAllLineItems);
router.put("/status", updateLineItemStatus); // new route for updating status
router.put("/:id/image", updateLineItemImage);

export default router;
