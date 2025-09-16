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
