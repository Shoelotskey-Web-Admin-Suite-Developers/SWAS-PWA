import { Request, Response } from "express";
import { Transaction } from "../models/Transactions";

// GET /transactions/:transaction_id
export const getTransactionById = async (req: Request, res: Response) => {
  const { transaction_id } = req.params;

  try {
    const transaction = await Transaction.findOne({ transaction_id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({ message: "Server error fetching transaction" });
  }
};

// GET /transactions
export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({ message: "Server error fetching transactions" });
  }
};