// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan"; // optional logging

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

// Load environment variables
dotenv.config();

// Express app
const app = express();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Environment Variable Debugging (optional for dev)
console.log("🔍 ENV CHECK:");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "❌ Missing");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "❌ Missing");

// ✅ Connect to MongoDB
try {
  await connectDB(process.env.MONGO_URI);
  console.log("✅ MongoDB connected successfully");
} catch (err) {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
}

// ✅ Middlewares
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true,
}));

app.use(express.json()); // for JSON body parsing
app.use(morgan("dev")); // optional for request logging

// ✅ Static file serving (for uploaded outfit images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 SmartFit Backend is running and healthy!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
