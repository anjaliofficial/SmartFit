// controllers/authController.js

require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// ---------------- SMTP TRANSPORTER ----------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Must be 16-char Google App Password
  },
});

// ---------------- SEND RESET LINK FUNCTION ----------------
const sendResetLink = async (email, token) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
    const mailOptions = {
      from: `"SmartFit Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset.</p>
        <p>Click below to reset your password (expires in 1 hour):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent:", info.response);
    return true;
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    return false;
  }
};

// ---------------- REGISTER USER ----------------
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- LOGIN USER ----------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate token & expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const sent = await sendResetLink(email, token);
    if (!sent) return res.status(500).json({ message: "Failed to send email" });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPasswordWithToken = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetToken !== token)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (Date.now() > user.resetTokenExpiry)
      return res.status(400).json({ message: "Token expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please login." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
