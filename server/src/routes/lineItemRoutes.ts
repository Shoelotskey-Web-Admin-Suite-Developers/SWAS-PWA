// src/routes/lineItemRoutes.ts
import { Router } from "express";
import { getLineItemsByStatus, updateLineItemStatus, getAllLineItems, updateLineItemImage, updateLineItemStorageFee } from "../controllers/lineItemController";

const router = Router();


router.get("/status/:status", getLineItemsByStatus);
router.get("/", getAllLineItems);
router.put("/status", updateLineItemStatus); // new route for updating status
router.put("/:line_item_id/image", updateLineItemImage);
router.put("/:line_item_id/storage-fee", updateLineItemStorageFee);

export default router;
