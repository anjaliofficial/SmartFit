// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

dotenv.config();

const app = express();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

// Connect to MongoDB
try {
  await connectDB(process.env.MONGO_URI);
  console.log("MongoDB connected ✅");
} catch (err) {
  console.error("MongoDB connection error ❌:", err);
  process.exit(1);
}

// Middleware: CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Parse JSON requests
app.use(express.json());

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SmartFit Backend is running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
