// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
} = require("../controllers/authController");

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // fixed
router.post("/reset-password", resetPasswordWithToken);

module.exports = router;
