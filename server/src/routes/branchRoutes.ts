import { Router } from "express";
import { getBranchByBranchId, getBranches } from "../controllers/branchController";

const router = Router();

router.get("/", getBranches);
router.get("/by-branch-id/:branch_id", getBranchByBranchId);router.get("/:id", getBranches); // You might want to create a separate controller for getting branch by ID

export default router;
