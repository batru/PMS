import express from "express";
//import { protect, admin } from '../middleware/authMiddleWare.js';
const router = express.Router();

import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleWare.js";

router.route("/").get(protect, admin, getUsers);

router.route("/register").post(protect, admin, registerUser);
router.route("/login").post(loginUser);

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
router
  .route("/me/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
