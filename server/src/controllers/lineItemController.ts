// src/controllers/lineItemController.ts
import { Request, Response } from "express";
import { LineItem } from "../models/LineItem";

// GET /line-items/status/:status
export const getLineItemsByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;

  try {
    const items = await LineItem.find({ current_status: status });

    if (!items || items.length === 0) {
      return res.status(404).json({ message: `No line items found with status "${status}"` });
    }

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching line items by status:", error);
    res.status(500).json({ message: "Server error fetching line items" });
  }
};

// GET /line-items
// Return all line items except those that are already Picked Up
export const getAllLineItems = async (req: Request, res: Response) => {
  try {
    // Build base filter: exclude items already 'Picked Up'
    const branch_id = req.query.branch_id as string | undefined;
    const filter: any = { current_status: { $ne: 'Picked Up' } };
    if (branch_id) {
      filter.branch_id = branch_id;
    }

    // Diagnostic: log counts to help debug why only one item is returned
    const totalInCollection = await LineItem.countDocuments();
    const totalNotPickedUp = await LineItem.countDocuments({ current_status: { $ne: 'Picked Up' } });
    const totalMatchingFilter = await LineItem.countDocuments(filter);
    console.debug('getAllLineItems: totalInCollection=', totalInCollection);
    console.debug('getAllLineItems: totalNotPickedUp=', totalNotPickedUp);
    console.debug('getAllLineItems: totalMatchingFilter=', totalMatchingFilter, 'filter=', filter);

    const items = await LineItem.find(filter);

    if (!items || items.length === 0) {
      return res.status(404).json({ message: 'No line items found' });
    }

    // Also log a sample of returned ids for quick verification
    try {
      console.debug('getAllLineItems: returning line_item_ids=', items.map((i: any) => i.line_item_id).slice(0, 50));
    } catch (e) {
      // ignore
    }

    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching all line items:', error);
    res.status(500).json({ message: 'Server error fetching line items' });
  }
};

// PUT /line-items/status
export const updateLineItemStatus = async (req: Request, res: Response) => {
  const { line_item_ids, new_status } = req.body;

  if (!line_item_ids || !new_status) {
    return res.status(400).json({ message: "line_item_ids and new_status are required" });
  }

  try {
    const updateFields: any = {
      current_status: new_status,
      latest_update: new Date(),
    };

    // If marking as Ready for Pickup, set pickUpNotice
    if (new_status === "Ready for Pickup") {
      updateFields.pickUpNotice = new Date();
    }

    const result = await LineItem.updateMany(
      { line_item_id: { $in: line_item_ids } },
      updateFields
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No line items found to update" });
    }

    res.status(200).json({ message: `${result.modifiedCount} line item(s) updated to "${new_status}"` });
  } catch (error) {
    console.error("Error updating line item status:", error);
    res.status(500).json({ message: "Server error updating line items" });
  }
};

// PUT /line-items/:line_item_id/image
export const updateLineItemImage = async (req: Request, res: Response) => {
  const { line_item_id } = req.params;
  const { type, url } = req.body; // type: "before" | "after", url: string

  if (!line_item_id) {
    return res.status(400).json({ message: "line_item_id is required in params" });
  }

  if (!["before", "after"].includes(type) || !url) {
    return res.status(400).json({ message: "type ('before' or 'after') and url are required" });
  }

  try {
    const updateField = type === "before" ? { before_img: url } : { after_img: url };
    const item = await LineItem.findOneAndUpdate(
      { line_item_id },
      updateField,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Line item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating line item image:", error);
    res.status(500).json({ message: "Server error updating image" });
  }
};

// PUT /line-items/:line_item_id/storage-fee
export const updateLineItemStorageFee = async (req: Request, res: Response) => {
  const { line_item_id } = req.params;
  const { storage_fee } = req.body;

  if (!line_item_id) {
    return res.status(400).json({ message: 'line_item_id is required in params' });
  }

  const feeNum = Number(storage_fee ?? NaN);
  if (!Number.isFinite(feeNum) || feeNum < 0) {
    return res.status(400).json({ message: 'storage_fee must be a non-negative number' });
  }

  try {
    // Increment the existing storage_fee by the provided amount instead of replacing it
    const updated = await LineItem.findOneAndUpdate(
      { line_item_id },
      { $inc: { storage_fee: feeNum }, $set: { latest_update: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Line item not found' });
    }

    return res.status(200).json({ message: 'Storage fee added', lineItem: updated });
  } catch (error) {
    console.error('Error updating storage fee for line item:', error);
    return res.status(500).json({ message: 'Server error updating storage fee' });
  }
};
