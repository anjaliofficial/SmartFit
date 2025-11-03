// controllers/outfitController.js
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data"; 
import Outfit from "../models/Outfit.js";
import fetch, { FormData as NodeFormData, fileFrom } from "node-fetch"; 
import dotenv from 'dotenv';
dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// ------------------- Helper: Remove Background -------------------
async function removeBackground(inputPath, outputPath, apiKey) {
    if (!apiKey) throw new Error("Remove.bg API key missing in .env");
    if (!fs.existsSync(inputPath)) {
        console.warn(`Input file not found for background removal: ${inputPath}`);
        return null; 
    }

    try {
        const form = new NodeFormData();
        const file = await fileFrom(inputPath); 
        form.append("image_file", file, path.basename(inputPath));
        form.append("size", "auto");

        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": apiKey },
            body: form,
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = `Remove.bg API error: ${response.status}`;
            try {
                const errorData = JSON.parse(text);
                errorMessage += ` - ${errorData.errors?.[0]?.title || text}`;
            } catch {
                errorMessage += ` - ${text}`;
            }
            throw new Error(errorMessage);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(outputPath, buffer);

        // Return relative path (frontend compatible)
        return path.relative(process.cwd(), outputPath).replace(/\\/g, "/");
    } catch (err) {
        console.error("Background removal service failed:", err.message);
        return null; 
    }
}

// ------------------- Upload Outfit -------------------
export const uploadOutfit = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Login required." });
        }

        const processedDir = path.join(UPLOAD_DIR, "processed");
        if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

        // Prepare ML Service Data
        const mlForm = new FormData();
        req.files.forEach(file => mlForm.append("files", fs.createReadStream(file.path), { filename: file.originalname }));
        ["occasion", "season", "name", "category"].forEach(field => {
            mlForm.append(field, req.body[field] || (field === "occasion" ? "Casual" : "all"));
        });

        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, mlForm, {
            headers: mlForm.getHeaders(),
            timeout: 120000,
        });

        if (!mlResponse.data.success) {
            console.error("ML Service Error:", mlResponse.data.error);
            return res.status(500).json({ success: false, message: "ML service failed", error: mlResponse.data.error });
        }

        const mlItems = Array.isArray(mlResponse.data.clothing_items)
            ? mlResponse.data.clothing_items
            : Object.values(mlResponse.data.clothing_items || {}).flat();

        const outfitsToSave = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const analysisItem = mlItems[i] || {};
            let finalImagePath = path.join("uploads", file.filename).replace(/\\/g, "/");

            // Optional background removal
            if (process.env.REMOVEBG_API_KEY) {
                const outputPath = path.join(processedDir, `bg_removed_${Date.now()}_${file.originalname}`);
                const bgRemovedPath = await removeBackground(file.path, outputPath, process.env.REMOVEBG_API_KEY);
                if (bgRemovedPath) finalImagePath = bgRemovedPath;
            }

            // Clean up temp file
            try { fs.unlinkSync(file.path); } catch { /* ignore */ }

            outfitsToSave.push({
                user: userId,
                name: req.body.name || path.basename(file.originalname, path.extname(file.originalname)),
                category: req.body.category || analysisItem.category || "Others",
                color: req.body.color || analysisItem.dominant_color_name || "unknown",
                season: req.body.season || "all",
                occasion: req.body.occasion || "casual",
                imageUrl: finalImagePath,
                style: analysisItem.style || "casual",
                pattern: analysisItem.pattern || "plain",
                dominantColors: analysisItem.dominant_colors || [],
            });
        }

        const savedOutfits = await Outfit.insertMany(outfitsToSave);
        return res.status(201).json({ success: true, message: "Outfits uploaded successfully", outfits: savedOutfits });
    } catch (err) {
        console.error("Upload Outfit Error:", err.stack);
        return res.status(500).json({ success: false, message: "Server error during upload", error: err.message });
    }
};

// ------------------- Get All Outfits -------------------
export const getAllOutfits = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const outfits = await Outfit.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, outfits });
    } catch (err) {
        console.error("Get All Outfits Error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch outfits", error: err.message });
    }
};

// ------------------- Update Outfit -------------------
export const updateOutfit = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id);
        if (!outfit) return res.status(404).json({ success: false, message: "Outfit not found" });

        if (outfit.user.toString() !== req.user?.id) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const updates = {};
        ["name", "category", "color", "season", "occasion", "style", "pattern"].forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const updatedOutfit = await Outfit.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
        res.status(200).json({ success: true, outfit: updatedOutfit });
    } catch (err) {
        console.error("Update Outfit Error:", err);
        res.status(500).json({ success: false, message: "Update failed", error: err.message });
    }
};

// ------------------- Delete Outfit -------------------
export const deleteOutfit = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id);
        if (!outfit) return res.status(404).json({ success: false, message: "Outfit not found" });

        if (outfit.user.toString() !== req.user?.id) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        if (outfit.imageUrl) {
            const fullImagePath = path.join(process.cwd(), outfit.imageUrl);
            if (fs.existsSync(fullImagePath)) fs.unlinkSync(fullImagePath);
        }

        await Outfit.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Outfit deleted" });
    } catch (err) {
        console.error("Delete Outfit Error:", err);
        res.status(500).json({ success: false, message: "Delete failed", error: err.message });
    }
};
