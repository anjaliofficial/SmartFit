import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// 🛑 CRITICAL FIX: Use asynchronous file operations for stability
import { unlink, rename } from "fs/promises"; 
import fetch, { FormData as NodeFormData, fileFrom } from "node-fetch";
import Outfit from "../models/Outfit.js";

dotenv.config();

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, "..");
const UPLOAD_DIR = path.join(PROJECT_ROOT, "uploads");
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

// ------------------- Helper: Remove Background -------------------
async function removeBackground(inputPath, outputPath, apiKey) {
  if (!apiKey || !fs.existsSync(inputPath)) return null;

  try {
    const form = new NodeFormData();
    // Using fileFrom requires node-fetch to be installed and working
    const file = await fileFrom(inputPath); 
    form.append("image_file", file, path.basename(inputPath));
    form.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });

    if (!response.ok)
      throw new Error(`Remove.bg error ${response.status}: ${await response.text()}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    // Using sync write is acceptable here as it's external data
    fs.writeFileSync(outputPath, buffer);

    // Return the public path relative to the project root (e.g., uploads/processed/...)
    return path.join("uploads", path.relative(UPLOAD_DIR, outputPath)).replace(/\\/g, "/");
  } catch (err) {
    console.error("Remove.bg failed:", err.message);
    return null;
  }
}

// ------------------- Create Outfit -------------------
export const createOutfit = async (req, res) => {
  const tempFilesToDelete = [];

  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const processedDir = path.join(UPLOAD_DIR, "processed");
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    const outfitsToSave = [];

    for (const file of req.files) {
      const originalTempPath = file.path;
      // Define the final public path for the original image in case BG removal fails
      const permanentOriginalPath = path.join(UPLOAD_DIR, path.basename(originalTempPath));
      let finalImagePath = path.join("uploads", path.basename(originalTempPath)).replace(/\\/g, "/");

      // We push the Multer temp file to the list. It will be deleted ONLY if BG removal succeeds.
      tempFilesToDelete.push(originalTempPath); 

      if (process.env.REMOVEBG_API_KEY) {
        const ext = path.extname(file.originalname);
        const outputPath = path.join(
          processedDir,
          `bg_removed_${Date.now()}_${path.basename(file.filename, ext)}.png`
        );
        
        const bgRemovedPath = await removeBackground(originalTempPath, outputPath, process.env.REMOVEBG_API_KEY);
        
        if (bgRemovedPath) {
          // Success: Use the processed image path. The original temp file is scheduled for deletion.
          finalImagePath = bgRemovedPath;
        } else {
          // Failure: Fallback to the original temporary file.
          console.warn(`Background removal failed for ${file.originalname}. Moving original file.`);
          
          // 🛑 CRITICAL FIX: Move the Multer temp file to a permanent spot
          await rename(originalTempPath, permanentOriginalPath);
          
          // The file was moved, not deleted, so remove it from the cleanup list
          tempFilesToDelete.pop(); 
        }
      } else {
        // BG removal is skipped: Move temp file to permanent spot
        // 🛑 CRITICAL FIX: Move the Multer temp file to a permanent spot
        await rename(originalTempPath, permanentOriginalPath);
        
        // The file was moved, not deleted, so remove it from the cleanup list
        tempFilesToDelete.pop(); 
      }
      
      outfitsToSave.push({
        user: userId,
        name: req.body.name || path.basename(file.originalname, path.extname(file.originalname)),
        category: req.body.category?.toLowerCase() || "others",
        color: req.body.color || "unknown",
        season: req.body.season || "all",
        occasion: req.body.occasion || "casual",
        imageUrl: finalImagePath, // Path is correctly set here
        style: req.body.style || "casual",
        pattern: req.body.pattern || "plain",
        dominantColors: [],
      });
    }

    // 🛑 CRITICAL FIX: Await all asynchronous deletions before responding
    await Promise.all(tempFilesToDelete.map(async (filePath) => {
        try {
            await unlink(filePath); // Use asynchronous unlink
        } catch (e) {
            console.error(`Failed to delete temp file: ${filePath}`, e.message);
        }
    }));

    const savedOutfits = await Outfit.insertMany(outfitsToSave);
    res.status(201).json({ success: true, outfits: savedOutfits });
  } catch (err) {
    console.error("Upload Outfit Error:", err);
    // Best practice cleanup for any remaining uploaded files if the process fails mid-way
    if (req.files) {
        // Attempt to clean up all files, regardless of tempFilesToDelete list
        await Promise.all(req.files.map(async (file) => {
            try {
                if (fs.existsSync(file.path)) await unlink(file.path);
            } catch (e) {
                // ignore
            }
        }));
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Get All Outfits -------------------
export const getOutfits = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const outfits = await Outfit.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, outfits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Update Outfit -------------------
export const updateOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) return res.status(404).json({ success: false, message: "Outfit not found" });
    if (outfit.user.toString() !== req.user?.id)
      return res.status(401).json({ success: false, message: "Not authorized" });

    const updates = {};
    ["name", "category", "color", "season", "occasion", "style", "pattern"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Outfit.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({ success: true, outfit: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- Delete Outfit -------------------
export const deleteOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) return res.status(404).json({ success: false, message: "Outfit not found" });
    if (outfit.user.toString() !== req.user?.id)
      return res.status(401).json({ success: false, message: "Not authorized" });

    if (outfit.imageUrl) {
      const fullPath = path.join(PROJECT_ROOT, outfit.imageUrl);
      if (fs.existsSync(fullPath)) {
        try {
          // 🛑 FIX: Use asynchronous unlink for best practice
          await unlink(fullPath); 
        } catch (e) {
          console.error(`Failed to delete image file: ${fullPath}`, e.message);
        }
      }
    }

    await Outfit.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Outfit deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};