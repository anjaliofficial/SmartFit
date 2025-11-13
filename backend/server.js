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

// --- Configuration ---
dotenv.config();

// ES module fixes for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Define UPLOAD_DIR
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log(`Creating uploads directory at: ${UPLOAD_DIR}`);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from the uploads directory (CORRECT LOCATION)
// Files in 'uploads' are now accessible via /uploads/filename.ext
app.use("/uploads", express.static(UPLOAD_DIR));

// Health check
app.get("/", (req, res) => res.send("🚀 SmartFit Backend running!"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Stack:", err.stack);
  
  // Handle specific known errors (like file size limits from Multer)
  let status = 500;
  let message = "Internal Server Error";

  if (err.status) {
      status = err.status;
      message = err.message;
  } else if (err.code === "LIMIT_FILE_SIZE") {
      status = 413; // Request Entity Too Large
      message = "File size limit exceeded.";
  } else {
      message = err.message; // Use the specific error message if available
  }

  res.status(status).json({ success: false, message: message });
});

// Start server
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("MongoDB connection successful.");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Exit process with failure code
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));
};

startServer();