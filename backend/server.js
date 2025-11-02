<<<<<<< HEAD
=======
// server.js
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
<<<<<<< HEAD
import morgan from "morgan";
import fs from "fs";
=======
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

<<<<<<< HEAD
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

// Ensure uploads folder exists in the backend root
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
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 🚨 CRITICAL FIX: Serve static files from the 'uploads' directory
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
// ✅ 404 Handler and Global Error Handler (Good Practice)
// ------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

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
=======
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
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
