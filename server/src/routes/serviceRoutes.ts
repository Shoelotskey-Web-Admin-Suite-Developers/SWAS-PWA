// src/routes/serviceRoutes.ts
import express from "express";
import { getAllServices, addService } from "../controllers/serviceController";

const router = express.Router();

// GET all services
router.get("/", getAllServices);

// POST a new service
router.post("/", addService);

export default router;
