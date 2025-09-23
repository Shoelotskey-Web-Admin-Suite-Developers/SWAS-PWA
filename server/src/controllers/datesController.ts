import { Request, Response } from "express";
import { Dates } from "../models/Dates";

// Create or update Dates by line_item_id
export const upsertDatesByLineItemId = async (req: Request, res: Response) => {
  try {
    const { line_item_id, srm_date, rd_date, ibd_date, wh_date, rb_date, is_date, rpu_date, current_status } = req.body;

    if (!line_item_id) {
      return res.status(400).json({ message: "line_item_id is required." });
    }

    const update = {
      ...(srm_date !== undefined && { srm_date }),
      ...(rd_date !== undefined && { rd_date }),
      ...(ibd_date !== undefined && { ibd_date }),
      ...(wh_date !== undefined && { wh_date }),
      ...(rb_date !== undefined && { rb_date }),
      ...(is_date !== undefined && { is_date }),
      ...(rpu_date !== undefined && { rpu_date }),
      ...(current_status !== undefined && { current_status }),
    };

    const datesDoc = await Dates.findOneAndUpdate(
      { line_item_id },
      { $set: update },
      { new: true, upsert: true }
    );

    res.status(200).json(datesDoc);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};