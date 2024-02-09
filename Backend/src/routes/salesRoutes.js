import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import { getSales, createSale } from "../controllers/salesController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getSales);

router.route("/:id").post(protect, createSale);

export default router;
