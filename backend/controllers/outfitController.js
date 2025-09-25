const express = require("express");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const router = express.Router();

// Multer setup for temporary upload folder
const upload = multer({ dest: "uploads/" });

// Placeholder background removal (currently just copies the file)
const removeBackground = async (inputPath, outputPath) => {
  fs.copyFileSync(inputPath, outputPath);
};

// ---------- Multi-File Upload Endpoint ----------
router.post("/upload", upload.any(), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const results = {};

  // Process each uploaded file
  for (const file of req.files) {
    const type = file.fieldname; // shirt, pants, shoes, etc.
    const outputPath = path.join("processed", file.originalname);
    fs.mkdirSync("processed", { recursive: true });

    try {
      await removeBackground(file.path, outputPath);

      // Send file to Flask ML service
      const formData = new FormData();
      formData.append("file", fs.createReadStream(outputPath));

      const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
        headers: formData.getHeaders(),
      });

      // Collect result for this item
      results[type] = {
        filename: response.data.filename,
        dominant_colors: response.data.dominant_colors,
        pattern: response.data.pattern,
        style: response.data.style,
        warnings: response.data.warnings,
      };
    } catch (err) {
      console.error(err);
      results[type] = {
        filename: null,
        warnings: ["Upload or analysis failed"],
      };
    }
  }

  res.json({ success: true, data: results });
});

module.exports = router;
