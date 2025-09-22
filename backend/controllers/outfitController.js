// controllers/outfitController.js
import path from "path";
import fs from "fs";
import fetch, { FormData } from "node-fetch";

// Utility to remove background via Remove.bg API
async function removeBackground(inputPath, outputPath, apiKey) {
  if (!fs.existsSync(inputPath)) throw new Error("Input file does not exist");

  const form = new FormData();
  form.append("image_file", fs.createReadStream(inputPath));
  form.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remove.bg API error: ${res.status} - ${text}`);
  }

  const buffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

// Upload outfit controller
export const uploadOutfit = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const result = {};
    const processedDir = path.join("uploads", "processed");
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    for (const key of Object.keys(req.files)) {
      const file = req.files[key][0];
      const inputPath = file.path;
      const outputFileName = `${Date.now()}_${file.originalname}`;
      const outputPath = path.join(processedDir, outputFileName);

      console.log(`${key} input path:`, inputPath);
      console.log(`${key} output path:`, outputPath);

      try {
        await removeBackground(inputPath, outputPath, process.env.REMOVEBG_API_KEY);
        console.log(`${key} background removed successfully`);
        result[key] = `/uploads/processed/${outputFileName}`;
      } catch (bgErr) {
        console.error(`${key} Remove.bg failed:`, bgErr);
        return res.status(500).json({
          success: false,
          message: `Background removal failed for ${key}`,
          error: bgErr.toString(),
        });
      }
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Upload outfit error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.toString() });
  }
};
