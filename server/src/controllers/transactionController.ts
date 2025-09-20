// src/controllers/transactionController.ts
import { Request, Response } from "express";
import { Transaction } from "../models/Transactions";
import { Customer } from "../models/Customer";
import { LineItem } from "../models/LineItem";

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { transaction_id } = req.params;
    const { branch_id } = req.query;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id required" });
    }
    if (!branch_id) {
      return res.status(400).json({ error: "branch_id required" });
    }

    // Find transaction scoped to branch
    const transaction = await Transaction.findOne({
      transaction_id,
      branch_id,
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Find customer
    const customer = await Customer.findOne({ cust_id: transaction.cust_id });

    // Find line items
    const lineItems = await LineItem.find({ transaction_id });

    return res.status(200).json({ transaction, customer, lineItems });
  } catch (err) {
    console.error("Error fetching transaction by ID:", err);
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return res.status(500).json({ error: "Server error", message });
  }
};
