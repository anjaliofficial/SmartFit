// routes/outfitRoutes.js
import express from "express";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
} from "../controllers/outfitController.js";

// Example Express setup
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const router = express.Router();

router.get("/", protect, getOutfits);
router.post("/", protect, upload.array("item_images", 5), createOutfit);
router.put("/:id", protect, updateOutfit);
router.delete("/:id", protect, deleteOutfit);

export default router;
