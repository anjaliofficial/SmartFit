import multer from 'multer';
import path from 'path';

// Define the storage configuration
const storage = multer.diskStorage({
  // CRITICAL: Files are saved permanently to the 'uploads/' folder
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  // CRITICAL: Creates a unique filename (timestamp + field name + extension)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // This 'filename' value is what we save to the database
    cb(null, Date.now() + '-' + file.fieldname + ext); 
  }
});

// ✅ FIX: Using 'export const' creates a named export
export const upload = multer({ storage: storage });

// The file is ready to be imported using: import { upload } from "..."