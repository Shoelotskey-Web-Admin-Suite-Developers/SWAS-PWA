// src/controllers/transactionController.ts
import { Request, Response } from "express";
import { Transaction } from "../models/Transactions";
import { Customer } from "../models/Customer";
import { LineItem } from "../models/LineItem";
import mongoose from "mongoose";

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

// Apply a payment to a transaction. If markPickedUp is true, also mark the specified line item as Picked Up
// Request body expected: { dueNow: number, customerPaid: number, modeOfPayment?: string, lineItemId?: string, markPickedUp?: boolean }
export const applyPayment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { transaction_id } = req.params;
    const { dueNow, customerPaid, modeOfPayment, lineItemId, markPickedUp } = req.body as {
      dueNow: number;
      customerPaid: number;
      modeOfPayment?: string;
      lineItemId?: string;
      markPickedUp?: boolean;
    };

    if (!transaction_id) return res.status(400).json({ error: "transaction_id required" });
    if (dueNow == null || customerPaid == null) return res.status(400).json({ error: "dueNow and customerPaid are required" });

    const transaction = await Transaction.findOne({ transaction_id }).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Transaction not found" });
    }

    // 1) Update transaction: no_released, amount_paid, payment_status, payment_mode
    // increment no_released by 1 only when marking picked up
    if (markPickedUp) {
      transaction.no_released = (transaction.no_released || 0) + 1;
    }

    // Add the dueNow to amount_paid
    transaction.amount_paid = (transaction.amount_paid || 0) + Number(dueNow);

    // Recompute payment_status: NP, PARTIAL, PAID
    const remaining = (transaction.total_amount || 0) - (transaction.amount_paid || 0);
    if (remaining <= 0) transaction.payment_status = "PAID";
    else if (transaction.amount_paid && transaction.amount_paid > 0) transaction.payment_status = "PARTIAL";
    else transaction.payment_status = "NP";

    // Update payment_mode: if provided and different, append separated by comma
    if (modeOfPayment) {
      const existing = (transaction.payment_mode as any) || "";
      if (!existing) (transaction.payment_mode as any) = modeOfPayment;
      else if (!existing.split(",").map((s: string) => s.trim()).includes(modeOfPayment)) {
        (transaction.payment_mode as any) = `${existing},${modeOfPayment}`;
      }
    }

    // If this action marks a picked-up item and it causes the transaction to have
    // no remaining pairs (i.e., last pair released), set date_out to now.
    if (markPickedUp && (transaction.no_pairs || 0) - (transaction.no_released || 0) <= 0) {
      transaction.date_out = new Date();
    }

    await transaction.save({ session });

    // 2) If marking picked up, update the specific line item current_status
    if (markPickedUp && lineItemId) {
      const lineItem = await LineItem.findOne({ line_item_id: lineItemId }).session(session);
      if (!lineItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Line item not found" });
      }
      lineItem.current_status = "Picked Up";
      await lineItem.save({ session });

      // 3) Update customer record totals
      const customer = await Customer.findOne({ cust_id: transaction.cust_id }).session(session);
      if (customer) {
        customer.total_services = (customer.total_services || 0) + 1;
        customer.total_expenditure = (customer.total_expenditure || 0) + (transaction.total_amount || 0);
        await customer.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, transaction });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error applying payment:", err);
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return res.status(500).json({ error: message });
  }
};
