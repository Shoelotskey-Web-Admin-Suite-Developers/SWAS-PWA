// src/models/LineItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILineItem extends Document {
  line_item_id: string;
  transaction_id: string;
  priority: "Rush" | "Normal";
  cust_id: string;
  service_id: string;
  storage_fee: number;
  branch_id: string;
  shoes: string;
  current_location: "Hub" | "Branch";
  current_status: string;
  due_date?: Date;
  latest_update: Date;
  before_img?: string;
  after_img?: string;
}

const LineItemSchema: Schema = new Schema<ILineItem>(
  {
    line_item_id: { type: String, required: true, unique: true },
    transaction_id: { type: String, required: true, ref: "Transaction" },
    priority: { type: String, enum: ["Rush", "Normal"], default: "Normal" },
    cust_id: { type: String, required: true, ref: "Customer" },
    service_id: { type: String, required: true },
    storage_fee: { type: Number, default: 0.0 },
    branch_id: { type: String, required: true },
    shoes: { type: String, required: true },
    current_location: { type: String, enum: ["Hub", "Branch"], required: true },
    current_status: { type: String, required: true },
    due_date: { type: Date, default: null },
    latest_update: { type: Date, default: Date.now },
    before_img: { type: String, default: null },
    after_img: { type: String, default: null },
  }
);

export const LineItem = mongoose.model<ILineItem>("LineItem", LineItemSchema, "line_items");
