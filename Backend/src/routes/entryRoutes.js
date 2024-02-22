import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  createEntry,
  deleteEntry,
  getDataRange,
  getEntriesToday,
  updateEntry,
} from "../controllers/entryController.js";
import { protect } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getEntriesToday);

router.route("/addEntry").post(protect, createEntry);
router.route("/dataRange").post(getDataRange);
router
  .route("/:id")

  .put(protect, updateEntry)
  .delete(protect, deleteEntry);

export default router;
