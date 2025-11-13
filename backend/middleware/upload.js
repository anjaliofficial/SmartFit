// middleware/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Fix __dirname for ESM: Points to the directory of this file (middleware)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UPLOAD_DIR: Navigate up one level to the root directory, then into 'uploads'
const UPLOAD_DIR = path.join(__dirname, "../uploads"); 

// The server.js should ideally handle the creation, but keeping this for robustness
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Use the absolute path defined above
  },
  filename: (req, file, cb) => {
    // Original filename can have issues, using Date.now() + UUID/Random string is safer.
    // Keeping your structure but adding a unique ID would be better.
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mimeType)) cb(null, true);
  else cb(new Error("Only image files (JPEG, PNG, WEBP, GIF) are allowed!"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});