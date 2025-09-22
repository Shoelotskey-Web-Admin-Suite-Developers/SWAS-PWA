// src/routes/transactionRoutes.ts
import { Router } from "express";
import { getTransactionById, applyPayment, getAllTransactions } from "../controllers/transactionController";

const router = Router();

router.get("/:transaction_id", getTransactionById);
router.post("/:transaction_id/apply-payment", applyPayment);
router.get("/", getAllTransactions);

export default router;