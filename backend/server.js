// server.js (Cleaned-up and Confirmed)
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";

// Import DB and routes (Assuming all are now using 'export default' or 'export const')
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Created uploads directory");
}

// ------------------------------
// ✅ Middleware
// ------------------------------
app.use(
    cors({
        origin: "http://localhost:5173", // Frontend URL
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------
// ✅ Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/outfits", outfitRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("🚀 SmartFit Backend is running smoothly!");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Global Error:", err.stack); // Use err.stack for detailed trace
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

// ------------------------------
// ✅ Start Server Function
// ------------------------------
const startServer = async () => {
    // Connect to MongoDB
    try {
        await connectDB(process.env.MONGO_URI);
        // REMOVED redundant console.log("✅ MongoDB connected successfully"); 
        // as connectDB prints its own success message
    } catch (err) {
        // connectDB already calls process.exit(1), but this catch block is good practice
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1); 
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🌐 Server running at: http://localhost:${PORT}`);
        console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");
    });
};

startServer();