import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // FIX: Ensure this path is relative to the current working directory, 
    // which should be the root of your backend project.
    const uploadPath = path.join(process.cwd(), "uploads"); 
    
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /png|jpg|jpeg/;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.test(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});