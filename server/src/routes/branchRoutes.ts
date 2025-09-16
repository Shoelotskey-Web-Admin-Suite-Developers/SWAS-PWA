import { Router } from "express";
import { getBranches } from "../controllers/branchController";

const router = Router();

router.get("/", getBranches);

export default router;
