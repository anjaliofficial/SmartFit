import express from "express";
// ✅ Confirmed file name and path: 'middleware/upload.js'
import { upload } from "../middleware/upload.js"; 
import { uploadOutfit, getAllOutfits, deleteOutfit, updateOutfit } from "../controllers/outfitController.js";

const router = express.Router();

// --- CRUD Routes ---
router.post("/upload", upload.array('item_images', 5), uploadOutfit); 
router.get("/", getAllOutfits);
router.put("/:id", updateOutfit); 
router.delete("/:id", deleteOutfit);

export default router;