import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import Outfit from "../models/Outfit.js"; 

const ML_SERVICE_URL = "http://127.0.0.1:5001";

/**
 * @desc Helper function to delete temporary files uploaded by multer
 */
const cleanupTempFiles = (files) => {
    // 🔑 Correction: Ensure files is an array before iterating
    if (files && Array.isArray(files)) { 
        files.forEach((file) => {
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
                });
            }
        });
    }
};

/**
 * @desc Upload clothing item(s), analyze via ML service, save metadata
 * @route POST /api/outfits/upload
 */
export const uploadOutfit = async (req, res) => {
    const cleanup = () => cleanupTempFiles(req.files);

    try {
        const uploadedFiles = req.files; 

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const formData = new FormData();
        
        uploadedFiles.forEach((file) => {
            formData.append('files', fs.createReadStream(file.path), { filename: file.originalname });
        });

        formData.append("occasion", req.body.occasion || "Casual"); 
        formData.append("season", req.body.season || "all");
        formData.append("name", req.body.name || "Unnamed Item");

        // Send to Flask ML microservice for analysis
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
            timeout: 120000,
        });

        cleanup(); 

        const data = mlResponse.data;

        if (!data.success) {
            return res.status(500).json({
                success: false,
                message: "ML service failed to analyze images",
                error: data.error || "Unknown error from ML service",
            });
        }

        // --- Save analyzed outfits to MongoDB ---
        const outfitsToSave = [];
        const userId = req.user?.id || "670b8dfe7c7f123abc000001"; 

        uploadedFiles.forEach((file, index) => {
            const analysisItem = data.clothing_items[index]; 

            if(analysisItem) {
                outfitsToSave.push({
                    user: userId,
                    name: req.body.name || path.basename(file.originalname, path.extname(file.originalname)),
                    category: req.body.category || analysisItem.category || "Others", 
                    color: req.body.color || analysisItem.dominant_color_name || "unknown",
                    season: req.body.season || "all",
                    occasion: req.body.occasion || "casual",
                    // The path saved by Multer on the Node server (e.g., uploads/filename.jpg)
                    imageUrl: file.path.replace(/\\/g, '/'), 
                    style: analysisItem.style || "casual",
                    pattern: analysisItem.pattern || "plain",
                    dominantColors: analysisItem.dominant_colors || [],
                });
            }
        });

        if (outfitsToSave.length > 0) {
            const savedOutfits = await Outfit.insertMany(outfitsToSave);
            return res.status(201).json({
                success: true,
                message: "Outfits uploaded & analyzed successfully",
                outfits: savedOutfits,
            });
        }
        
        return res.status(200).json({ success: true, message: "Files analyzed, but no items saved." });

    } catch (err) {
        cleanup(); 
        console.error("❌ Upload error:", err);

        let errorMessage = err.message;
        if (axios.isAxiosError(err) && err.response) {
            errorMessage = `ML Service Error (${err.response.status}): ${JSON.stringify(err.response.data)}`;
        } else if (axios.isAxiosError(err)) {
            errorMessage = `ML Service Connection Error: ${err.code}`;
        }
        
        return res.status(500).json({
            success: false,
            message: "Error processing upload or connecting to ML service",
            error: errorMessage,
        });
    }
};

/**
 * @desc Get all outfits for a user
 * @route GET /api/outfits
 */
export const getAllOutfits = async (req, res) => {
    try {
        const userId = req.user?.id || "670b8dfe7c7f123abc000001"; 
        const outfits = await Outfit.find({ user: userId }).sort({ createdAt: -1 });
        // 🔑 Ensure the response structure matches what the frontend expects
        return res.status(200).json({ success: true, outfits }); 
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch outfits",
            error: err.message,
        });
    }
};

/**
 * @desc Update a clothing item's metadata (e.g., name, category, color)
 * @route PUT /api/outfits/:id
 */
export const updateOutfit = async (req, res) => {
    try {
        const outfitId = req.params.id;
        const userId = req.user?.id || "670b8dfe7c7f123abc000001";
        
        const outfit = await Outfit.findById(outfitId);
        if (!outfit) return res.status(404).json({ success: false, message: "Outfit item not found" });

        if (outfit.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: "Not authorized to update this item" });
        }
        
        const updateFields = {
            name: req.body.name,
            category: req.body.category,
            color: req.body.color,
            season: req.body.season,
            occasion: req.body.occasion,
        };

        const sanitizedUpdates = Object.fromEntries(
            Object.entries(updateFields).filter(([_, v]) => v !== undefined && v !== null && v !== "")
        );

        const updatedOutfit = await Outfit.findByIdAndUpdate(
            outfitId,
            { $set: sanitizedUpdates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, outfit: updatedOutfit, message: "Outfit item updated successfully" });

    } catch (err) {
        console.error("❌ Update error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to update outfit item",
            error: err.message,
        });
    }
};

/**
 * @desc Delete an outfit
 * @route DELETE /api/outfits/:id
 */
export const deleteOutfit = async (req, res) => {
    try {
        const outfitId = req.params.id;
        const userId = req.user?.id || "670b8dfe7c7f123abc000001";
        
        const outfit = await Outfit.findById(outfitId);
        if (!outfit) return res.status(404).json({ success: false, message: "Outfit item not found" });
        
        if (outfit.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: "Not authorized to delete this outfit" });
        }

        // Delete local image file
        const imagePath = outfit.imageUrl;
        if (imagePath && imagePath.startsWith("uploads/")) {
            // path.resolve creates the full path from the project root
            const imageFullPath = path.resolve(imagePath); 
            
            if (fs.existsSync(imageFullPath)) {
                fs.unlink(imageFullPath, (err) => {
                    if (err) console.error("Failed to delete permanent file:", imageFullPath, err);
                });
            }
        }

        // Delete from DB
        await Outfit.findByIdAndDelete(outfitId);

        return res.status(200).json({ success: true, message: "Outfit deleted successfully" });
    } catch (err) {
        console.error("❌ Delete error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to delete outfit",
            error: err.message,
        });
    }
};