// src/routes/customerRoutes.ts
import { Router } from "express";
import { getCustomers, deleteCustomer, updateCustomer } from "../controllers/customerController";

const router = Router();

router.get("/", getCustomers);
router.put("/:cust_id", updateCustomer);
router.delete("/:cust_id", deleteCustomer);

export default router;
