import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  getParkings,
  getParkingsById,
  createParking,
  updateParking,
  deleteParking,
  getParkedVehicles,
  getParkedVehiclesToday,
  getCurrentYearCheckins,
  searchParking,
} from "../controllers/parkingController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, getParkings);
router.route("/parkedVehicles").get(protect, getParkedVehicles);
router.route("/parkedVehiclesToday").get(getParkedVehiclesToday);
router.route("/parkedVehiclesYear").get(getCurrentYearCheckins);

router.route("/addParking").post(protect, createParking);
router.route("/search").get(searchParking);

router
  .route("/:id")
  .get(protect, getParkingsById)
  .put(protect, admin, updateParking)
  .delete(protect, admin, deleteParking);

export default router;
