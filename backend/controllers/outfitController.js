// controllers/outfitController.js
import fs from "fs";
import path from "path";
import fetch, { FormData, fileFrom } from "node-fetch";

// ------------------- Remove Background Function -------------------
async function removeBackground(inputPath, outputPath, apiKey) {
  const absInput = path.resolve(inputPath);
  const absOutput = path.resolve(outputPath);

  console.log("removeBackground called:", { absInput, absOutput });

  if (!apiKey) {
    throw new Error("Remove.bg API key missing. Set REMOVEBG_API_KEY in .env");
  }

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  try {
    const form = new FormData();
    const file = await fileFrom(absInput); // ensures correct metadata
    form.append("image_file", file, path.basename(absInput));
    form.append("size", "auto");

    console.log("Sending request to remove.bg...");
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: form,
    });

    console.log("Remove.bg response status:", response.status, response.statusText);

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const text = await response.text();
      console.error("Remove.bg error body:", text);
      throw new Error(`Remove.bg API error: ${response.status} - ${text}`);
    }

    if (contentType.includes("application/json")) {
      const json = await response.json();
      console.error("Remove.bg returned JSON (unexpected):", json);
      throw new Error(
        "Remove.bg returned JSON instead of an image: " + JSON.stringify(json)
      );
    }

    // Save processed image
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(absOutput, buffer);
    console.log("Saved processed image:", absOutput, "size:", buffer.length);

    return absOutput;
  } catch (err) {
    console.error("removeBackground failed:", err);
    throw err;
  }
}

// ------------------- Upload Outfit Controller -------------------
export const uploadOutfit = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const result = {};
    const processedDir = path.join("uploads", "processed");
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    // Loop through uploaded files
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
