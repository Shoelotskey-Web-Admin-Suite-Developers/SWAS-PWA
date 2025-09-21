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
    return res.status(400).json({ message: "line_item=ids and new_status are required" });
  }

  try {
    const result = await LineItem.updateMany(
      { line_item_id: { $in: line_item_ids } },
      { current_status: new_status, latest_update: new Date() }
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
