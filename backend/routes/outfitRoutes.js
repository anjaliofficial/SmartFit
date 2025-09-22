import express from "express";
import multer from "../utils/multerConfig.js";
import { uploadOutfit } from "../controllers/outfitController.js";

const router = express.Router();

router.post(
  "/upload",
  multer.fields([
    { name: "shirt", maxCount: 1 },
    { name: "pants", maxCount: 1 },
    { name: "shoes", maxCount: 1 },
    { name: "jacket", maxCount: 1 },
    { name: "accessories", maxCount: 1 },
    { name: "bag", maxCount: 1 },
  ]),
  uploadOutfit
);

export default router; // ✅ default export
