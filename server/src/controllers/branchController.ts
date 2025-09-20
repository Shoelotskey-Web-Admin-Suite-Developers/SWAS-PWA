import { Request, Response } from "express";
import { Branch } from "../models/Branch";

// Get all branches
export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branches", error });
  }
};

export const getBranchByBranchId = async (req: Request, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findOne({ branch_id: req.params.branch_id });
    if (!branch) {
      res.status(404).json({ message: "Branch not found" });
      return;
    }
    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branch", error });
  }
}