// src/routes/transactionRoutes.ts
import { Router } from "express";
import { getTransactionById, applyPayment } from "../controllers/transactionController";

const router = Router();

router.get("/:transaction_id", getTransactionById);
router.post("/:transaction_id/apply-payment", applyPayment);

export default router;
