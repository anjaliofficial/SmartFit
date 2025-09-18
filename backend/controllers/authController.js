const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Setup Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ---------------- REGISTER ----------------
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------- LOGIN ----------------
// ---------------- LOGIN ----------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if email & password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email }, // avoid sending password
    });
  } catch (err) {
    console.error("Login Error:", err); // Detailed server-side log
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};








// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving to DB for security
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token and expiration (e.g., 1 hour) in user model
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Construct reset URL
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&id=${user._id}`;

    // Send email using Nodemailer
    await transporter.sendMail({
      from: `"SmartFit" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  const { token, id, newPassword } = req.body;

  if (!token || !id || !newPassword)
    return res.status(400).json({ message: "Token, user ID, and new password are required" });

  try {
    // Hash the received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by hashed token and check expiration
    const user = await User.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
