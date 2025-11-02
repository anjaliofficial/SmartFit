import express from "express";
// ✅ FIX: Using named import { upload } to match the named export in upload.js
import { upload } from "../middleware/upload.js"; 
import { uploadOutfit, getAllOutfits, deleteOutfit, updateOutfit } from "../controllers/outfitController.js";

const router = express.Router();

// --- CRUD Routes ---

// Upload multiple outfit images (up to 10 files)
// This uses the correctly imported Multer middleware
router.post("/upload", upload.array('item_images', 10), uploadOutfit);

// Get all outfits for the logged-in user
router.get("/", getAllOutfits);

// Update outfit metadata by ID
router.put("/:id", updateOutfit);

// Delete outfit by ID
router.delete("/:id", deleteOutfit);

export default router;import express from "express";
