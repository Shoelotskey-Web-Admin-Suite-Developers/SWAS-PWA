import { Router } from "express";
import { getTransactionById, getAllTransactions } from "../controllers/transactionController";

const router = Router();

router.get("/:transaction_id", getTransactionById);
router.get("/", getAllTransactions);

export default router;