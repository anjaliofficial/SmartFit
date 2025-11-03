import express from "express";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadOutfit,
  getAllOutfits,
  deleteOutfit
} from "../controllers/outfitController.js";

const router = express.Router();

router.post("/upload", protect, upload.array("item_images", 5), uploadOutfit);
router.get("/", protect, getAllOutfits);
router.delete("/:id", protect, deleteOutfit);

export default router;
