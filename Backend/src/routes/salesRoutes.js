import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  getSales,
  createSale,
  getSalesRange,
} from "../controllers/salesController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getSales);
router.route("/salesRange").get(getSalesRange);
router.route("/:id").post(protect, createSale);

export default router;
