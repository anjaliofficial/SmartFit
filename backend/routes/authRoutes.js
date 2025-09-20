// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  getProfile

} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // fixed
router.post("/reset-password", resetPasswordWithToken);
router.get("/profile", authMiddleware, getProfile);


module.exports = router;
