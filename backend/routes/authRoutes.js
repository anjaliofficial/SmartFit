// routes/authRoutes.js
import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

// ✅ CORRECT: Importing the default export (protect)
import { protect } from "../middleware/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

// Protected routes using the imported 'protect' middleware
router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile);

export default router;