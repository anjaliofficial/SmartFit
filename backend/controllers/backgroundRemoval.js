// controllers/backgroundRemoval.js
import fs from "fs";
import path from "path";
import fetch, { FormData, fileFrom } from "node-fetch";

export async function removeBackground(inputPath, outputPath, apiKey) {
  console.log("removeBackground called:", { inputPath, outputPath });

  if (!apiKey) {
    throw new Error("Remove.bg API key missing. Set REMOVEBG_API_KEY in .env");
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  try {
    // Create FormData and append file using fileFrom (node-fetch)
    const form = new FormData();
    // fileFrom ensures correct file metadata for multipart form
    const file = await fileFrom(inputPath);
    form.append("image_file", file, path.basename(inputPath));
    form.append("size", "auto");

    console.log("Sending request to remove.bg...");
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        // DO NOT set Content-Type here — node-fetch FormData handles it
      },
      body: form,
    });

    console.log("Remove.bg response status:", response.status, response.statusText);
    const contentType = response.headers.get("content-type") || "";
    console.log("Remove.bg content-type:", contentType);

    // If it's not OK, capture whatever body they returned (usually JSON with error)
    if (!response.ok) {
      const text = await response.text();
      console.error("Remove.bg error body:", text);
      throw new Error(`Remove.bg API error: ${response.status} - ${text}`);
    }

    // If the API returned JSON unexpectedly, log it and raise
    if (contentType.includes("application/json")) {
      const json = await response.json();
      console.error("Remove.bg returned JSON (unexpected):", json);
      throw new Error("Remove.bg returned JSON instead of an image: " + JSON.stringify(json));
    }

    // Otherwise read image bytes
    const arrayBuffer = await response.arrayBuffer(); // preferred method
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    console.log("Saved processed image:", outputPath, "size:", buffer.length);

    return outputPath;
  } catch (err) {
    console.error("removeBackground failed:", err);
    throw err;
  }
}
