import express from "express";
// Middleware to handle file uploads via multer
import { upload } from "../middleware/upload.js"; 
import { uploadOutfit, getAllOutfits, deleteOutfit, updateOutfit } from "../controllers/outfitController.js";

const router = express.Router();

// --- CRUD Routes ---

// Upload multiple outfit images (up to 10 files)
router.post("/upload", upload.array('item_images', 10), uploadOutfit);

// Get all outfits for the logged-in user
router.get("/", getAllOutfits);

// Update outfit metadata by ID
router.put("/:id", updateOutfit);

// Delete outfit by ID
router.delete("/:id", deleteOutfit);

export default router;