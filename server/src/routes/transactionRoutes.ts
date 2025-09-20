// src/routes/transactionRoutes.ts
import { Router } from "express";
import { getTransactionById } from "../controllers/transactionController";

const router = Router();

router.get("/:transaction_id", getTransactionById);

export default router;
