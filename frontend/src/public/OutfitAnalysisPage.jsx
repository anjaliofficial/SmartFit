// src/pages/OutfitAnalysisPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

const OutfitAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { images } = location.state || {};

  if (!images) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 p-6">
          <p className="text-lg text-gray-700 mb-4">No images uploaded.</p>
          <button
            onClick={() => navigate("/uploadimage")}
            className="bg-cyan-500 text-white px-6 py-3 rounded hover:bg-cyan-600 transition"
          >
            Go Back to Upload
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ==========================
  // Mocked Analysis Logic
  // ==========================

  // Color compatibility rules
  const compatibleColors = {
    Blue: ["Black", "White", "Beige", "Neutral"],
    Red: ["Black", "White", "Neutral"],
    White: ["Black", "Blue", "Red", "Beige", "Neutral"],
    Black: ["Blue", "Red", "White", "Beige", "Neutral"],
    Beige: ["Blue", "White", "Black", "Neutral"],
    Neutral: ["Blue", "Red", "White", "Black", "Beige", "Neutral"],
  };

  // Color detection by filename
  const detectColor = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("blue")) return "Blue";
    if (name.includes("red")) return "Red";
    if (name.includes("white")) return "White";
    if (name.includes("black")) return "Black";
    if (name.includes("beige")) return "Beige";
    return "Neutral";
  };

  // Mock style detection
  const detectStyle = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("shirt") || name.includes("blazer")) return "Formal";
    if (name.includes("tshirt") || name.includes("jeans")) return "Casual";
    if (name.includes("sneaker") || name.includes("tracksuit")) return "Sporty";
    return "Casual";
  };

  // Mock pattern detection
  const detectPattern = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("stripe")) return "Stripes";
    if (name.includes("check")) return "Checks";
    if (name.includes("dot") || name.includes("floral")) return "Print";
    return "Solid";
  };

  // Detect features
  const shirtColor = detectColor(images.shirt);
  const pantsColor = detectColor(images.pants);
  const shoesColor = detectColor(images.shoes);

  const shirtStyle = detectStyle(images.shirt);
  const pantsStyle = detectStyle(images.pants);
  const shoesStyle = detectStyle(images.shoes);

  const shirtPattern = detectPattern(images.shirt);
  const pantsPattern = detectPattern(images.pants);
  const shoesPattern = detectPattern(images.shoes);

  // Check compatibility
  const isCompatible =
    compatibleColors[shirtColor]?.includes(pantsColor) &&
    compatibleColors[shirtColor]?.includes(shoesColor);

  const stylesMatch = shirtStyle === pantsStyle || pantsStyle === shoesStyle;

  const clashPattern =
    shirtPattern !== "Solid" &&
    pantsPattern !== "Solid" &&
    shirtPattern !== pantsPattern;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Outfit Analysis</h1>

        {/* Uploaded Items Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {["shirt", "pants", "shoes"].map((type) => (
            <div
              key={type}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <h2 className="capitalize text-xl font-semibold mb-4">{type}</h2>
              <img
                src={images[type]}
                alt={type}
                className="w-full h-48 object-contain rounded-lg"
              />
              <p className="mt-2 text-gray-700 font-medium">
                Color:{" "}
                {type === "shirt"
                  ? shirtColor
                  : type === "pants"
                  ? pantsColor
                  : shoesColor}
              </p>
              <p className="text-gray-600">
                Style:{" "}
                {type === "shirt"
                  ? shirtStyle
                  : type === "pants"
                  ? pantsStyle
                  : shoesStyle}
              </p>
              <p className="text-gray-600">
                Pattern:{" "}
                {type === "shirt"
                  ? shirtPattern
                  : type === "pants"
                  ? pantsPattern
                  : shoesPattern}
              </p>
            </div>
          ))}
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Color Compatibility */}
          <div
            className={`p-6 rounded-xl shadow ${
              isCompatible
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">Color Analysis</h2>
            <p className="text-lg">
              {isCompatible
                ? "✅ Your outfit colors are compatible!"
                : "⚠️ Colors may not match perfectly."}
            </p>
          </div>

          {/* Style Compatibility */}
          <div
            className={`p-6 rounded-xl shadow ${
              stylesMatch
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">Style Check</h2>
            <p className="text-lg">
              {stylesMatch
                ? "✅ Styles look consistent across your outfit."
                : "⚠️ Mixed styles detected. Consider aligning them."}
            </p>
          </div>

          {/* Pattern Clash */}
          <div
            className={`p-6 rounded-xl shadow ${
              clashPattern
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">Pattern Analysis</h2>
            <p className="text-lg">
              {clashPattern
                ? "⚠️ Pattern clash detected. Try pairing one solid with a patterned item."
                : "✅ Patterns look balanced."}
            </p>
          </div>

          {/* Proportion & Fit (Mock) */}
          <div className="p-6 rounded-xl shadow bg-blue-100 text-blue-800">
            <h2 className="text-2xl font-bold mb-2">Proportion & Fit</h2>
            <p className="text-lg">
              Shirt length works well with pants. Shoes align with overall
              style.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="bg-cyan-500 text-white px-6 py-3 rounded hover:bg-cyan-600 transition font-semibold"
            onClick={() => alert("Outfit saved to favorites!")}
          >
            Save Outfit
          </button>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition font-semibold"
            onClick={() => alert("Wearing this outfit today!")}
          >
            Wear Now
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400 transition font-semibold"
            onClick={() => navigate("/upload")}
          >
            Upload New Items
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OutfitAnalysisPage;
