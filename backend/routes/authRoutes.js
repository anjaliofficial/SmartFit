const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  getProfile,
  updateProfile
} = require("../controllers/authController");

// import default exported middleware
const protect = require("../middleware/authMiddleware");

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

// Use `protect` middleware
router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
