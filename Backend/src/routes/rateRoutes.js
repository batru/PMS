import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  getRates,
  getRateById,
  createRate,
  updateRate,
  deleteRate,
} from "../controllers/rateController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getRates);

router.route("/addRate").post(protect, admin, createRate);

router
  .route("/:id")
  .get(protect, getRateById)
  .put(protect, admin, updateRate)
  .delete(protect, admin, deleteRate);

export default router;
