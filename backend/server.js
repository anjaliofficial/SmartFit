import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------
// ✅ Database Connection
// ------------------------------
try {
  await connectDB(process.env.MONGO_URI);
  console.log("✅ MongoDB connected successfully");
} catch (err) {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
}

// ------------------------------
// ✅ Express App Initialization
// ------------------------------
const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// ------------------------------
// ✅ Middleware Configuration
// ------------------------------
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Serve static uploaded files
app.use("/uploads", express.static(uploadDir));

// ------------------------------
// ✅ API Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);

// ------------------------------
// ✅ Health Check Route
// ------------------------------
app.get("/", (req, res) => {
  res.send("🚀 SmartFit Backend is running smoothly!");
});

// ------------------------------
// ✅ 404 Handler
// ------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ------------------------------
// ✅ Global Error Handler
// ------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// ------------------------------
// ✅ Start Server
// ------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🌐 Server running at: http://localhost:${PORT}`)
);