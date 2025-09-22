// utils/backgroundRemoval.js
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

/**
 * Remove background from a local image using Remove.bg API.
 * @param {string} inputPath - Path to input image (local file)
 * @param {string} outputPath - Path to save background-removed image
 * @param {string} apiKey - Your Remove.bg API key
 */
export async function removeBackground(inputPath, outputPath, apiKey) {
  try {
    const form = new FormData();
    form.append("image_file", fs.createReadStream(inputPath));
    form.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text(); // get full error message
      throw new Error(`Remove.bg API error: ${response.status} - ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(outputPath, buffer);
  } catch (err) {
    console.error("Remove.bg request failed:", err);
    throw err; // propagate error to controller
  }
}
