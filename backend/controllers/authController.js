// controllers/authController.js (Corrected for ES Modules)
import dotenv from "dotenv";
dotenv.config(); // Initialize dotenv

import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js"; // *** MUST USE .js EXTENSION ***

// ---------------- SMTP TRANSPORTER ----------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-char Google App Password
  },
});

// ---------------- SEND RESET LINK ----------------
const sendResetLink = async (email, token) => {
  // ... (sendResetLink logic remains the same)
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
    const mailOptions = {
      from: `"SmartFit Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset.</p>
        <p>Click below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Reset email sent to:", email);
    return true;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return false;
  }
};

// ---------------- REGISTER USER ----------------
export const registerUser = async (req, res) => { // CHANGED: export const
  try {
    const { name, email, password } = req.body;
    // ... (rest of the registerUser logic)
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- LOGIN USER ----------------
export const loginUser = async (req, res) => { // CHANGED: export const
  // ... (rest of the loginUser logic)
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPassword = async (req, res) => { // CHANGED: export const
  // ... (rest of the forgotPassword logic)
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour valid

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const sent = await sendResetLink(email, token);
    if (!sent) return res.status(500).json({ message: "Failed to send email" });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPasswordWithToken = async (req, res) => { // CHANGED: export const
  // ... (rest of the resetPasswordWithToken logic)
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetToken !== token)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (Date.now() > user.resetTokenExpiry)
      return res.status(400).json({ message: "Token expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET PROFILE ----------------
export const getProfile = async (req, res) => { // CHANGED: export const
  // ... (rest of the getProfile logic)
  try {
    const user = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfile = async (req, res) => { // CHANGED: export const
  // ... (rest of the updateProfile logic)
  try {
    const { name, darkMode, notifications } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (darkMode !== undefined) user.darkMode = darkMode;
    if (notifications !== undefined) user.notifications = notifications;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        darkMode: user.darkMode,
        notifications: user.notifications,
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};