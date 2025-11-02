import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import Outfit from "../models/Outfit.js"; 

const ML_SERVICE_URL = "http://127.0.0.1:5001";

/**
 * @desc Helper function to delete temporary files uploaded by multer
 * NOTE: This is for files saved by Multer with a temporary destination 
 * or files saved by the ML Service. It is NOT needed for the permanent 
 * files saved by Multer's diskStorage to the 'uploads/' directory.
 */
const cleanupTempFiles = (files) => {
    if (files && Array.isArray(files)) { 
        files.forEach((file) => {
            // Check if the file path exists before attempting to delete
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
    const cleanup = () => {
        // Only clean up the files if they were saved to a temporary location
        // Since Multer is using diskStorage to 'uploads/', the files are permanent.
        // We only clean files here if your ML service creates additional temporary files 
        // that are also added to req.files or handled elsewhere.
        // For standard Multer behavior, this cleanup is often skipped or handled differently.
        // For safety, we leave it here, but it's often a source of confusion.
        // If your Multer middleware does not save files to a temporary location, this is safe to keep 
        // but remember req.files[].path gives the final path in diskStorage mode.
        // We will proceed assuming your Multer configuration saves files directly 
        // to 'uploads/' and req.files[].filename is the unique name.
        // We will call cleanupTempFiles if you decide to use memoryStorage or if the ML service saves temporary files.
    };

    try {
        const uploadedFiles = req.files;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const formData = new FormData();
        // IMPORTANT: When using diskStorage, Multer saves the file permanently. 
        // We read from the saved file's path for the ML Service.
        uploadedFiles.forEach((file) => {
            // Use file.path for the ReadStream, as Multer has created the file on disk.
            formData.append('files', fs.createReadStream(file.path), { filename: file.originalname });
        });

        formData.append("occasion", req.body.occasion || "Casual"); 
        formData.append("season", req.body.season || "all");
        formData.append("name", req.body.name || "Unnamed Item");
        formData.append("category", req.body.category || "Others"); 

        // Send files to ML service for analysis
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
            timeout: 120000,
        });

        // We skip cleanup here, assuming Multer saved permanently. 
        // If the ML service creates a temp file, handle its deletion separately.
        // cleanup(); // You can uncomment this if needed for ML temporary files

        const data = mlResponse.data;

        if (!data.success) {
            return res.status(500).json({
                success: false,
                message: "ML service failed to analyze images",
                error: data.error || "Unknown error from ML service",
            });
        }

        // --- ML Response Processing (Unchanged) ---
        let mlItems = [];
        if (data.clothing_items && typeof data.clothing_items === "object" && !Array.isArray(data.clothing_items)) {
            mlItems = Object.values(data.clothing_items).flat();
        } else if (Array.isArray(data.clothing_items)) {
            mlItems = data.clothing_items;
        }

        const outfitsToSave = [];
        // Assuming user ID is available via authentication middleware (req.user)
        const userId = req.user?.id || "670b8dfe7c7f123abc000001"; 

        const combinedPreviewUrl = data.combined_preview ? data.combined_preview.replace(/\\/g, '/') : null;


        uploadedFiles.forEach((file, index) => {
            let analysisItem = mlItems[index];

            // Fallback: match by filename substring
            if (!analysisItem && mlItems.length > 0) {
                const origName = (file.originalname || "").toLowerCase();
                analysisItem = mlItems.find(mi => {
                    const fname = (mi.filename || mi.name || "").toLowerCase();
                    return fname && origName && fname.includes(origName);
                });
            }

            const chosenAnalysis = analysisItem || {};
            
            // 🚨 CRITICAL FIX: Construct the correct path for the DB
            // Multer's diskStorage saves the file using the name in file.filename 
            // into the 'uploads/' folder. We save 'uploads/filename.ext' to the DB.
            let imagePathToSave;
            if (combinedPreviewUrl) {
                // If ML service returns a combined preview (e.g., 'uploads/preview.jpg')
                imagePathToSave = combinedPreviewUrl;
            } else {
                // Use the filename generated by Multer
                imagePathToSave = `uploads/${file.filename}`; 
            }
            
            outfitsToSave.push({
                user: userId,
                name: req.body.name || path.basename(file.originalname, path.extname(file.originalname)),
                category: req.body.category || chosenAnalysis.category || "Others",
                color: req.body.color || chosenAnalysis.dominant_color_name || "unknown",
                season: req.body.season || "all",
                occasion: req.body.occasion || "casual",
                // Store the correct relative path for frontend access
                imageUrl: imagePathToSave, 
                style: chosenAnalysis.style || "casual",
                pattern: chosenAnalysis.pattern || "plain",
                dominantColors: chosenAnalysis.dominant_colors || [],
            });
        });

        if (outfitsToSave.length > 0) {
            const savedOutfits = await Outfit.insertMany(outfitsToSave);
            return res.status(201).json({
                success: true,
                message: "Outfits uploaded & analyzed successfully",
                outfits: savedOutfits,
                combined_preview: combinedPreviewUrl 
            });
        }

        return res.status(200).json({ success: true, message: "Files analyzed, but no items saved." });

    } catch (err) {
        // cleanup(); // Ensure temp files are cleaned in case of error
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

// --- Helper function removed to simplify code ---
// If the ML service returns a combined_preview path, you might need a simple helper:
// const getRelativeImagePath = (fullPath) => fullPath ? fullPath.substring(fullPath.indexOf('uploads' + path.sep)).replace(/\\/g, '/') : "";

// -----------------------------------------------------------------------------

/**
 * @desc Get all outfits for a user
 * @route GET /api/outfits
 */
export const getAllOutfits = async (req, res) => {
    try {
        const userId = req.user?.id || "670b8dfe7c7f123abc000001"; 
        const outfits = await Outfit.find({ user: userId }).sort({ createdAt: -1 });
        
        return res.status(200).json({ success: true, outfits: outfits }); 
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

        // Delete local image file if exists
        const imagePath = outfit.imageUrl;
        // The image path stored in DB is 'uploads/filename.jpg'
        if (imagePath && imagePath.startsWith("uploads/")) {
            // Resolve the path relative to the current working directory (backend folder)
            const imageFullPath = path.resolve(path.join(process.cwd(), imagePath)); 
            
            if (fs.existsSync(imageFullPath)) {
                fs.unlink(imageFullPath, (err) => {
                    if (err) console.error("Failed to delete permanent file:", imageFullPath, err);
                });
            }
        }

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