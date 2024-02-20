import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  getSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
} from "../controllers/slotController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getSlots);

router.route("/addSlot").post(protect, createSlot);

router
  .route("/:id")
  .get(protect, getSlotById)
  .put(protect, admin, updateSlot)
  .delete(protect, admin, deleteSlot);

export default router;
