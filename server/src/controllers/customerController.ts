// src/controllers/customerController.ts
import { Request, Response } from "express";
import { Customer } from "../models/Customer";

// Get all customers
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

// Delete customer by cust_id
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cust_id } = req.params;

    const deleted = await Customer.findOneAndDelete({ cust_id });

    if (!deleted) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};

// Update customer by cust_id
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cust_id } = req.params;
    const updateData = req.body;

    const updated = await Customer.findOneAndUpdate(
      { cust_id },
      updateData,
      { new: true, runValidators: true } // return updated doc + validate schema
    );

    if (!updated) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};
