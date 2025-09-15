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
            onClick={() => navigate("/upload")}
            className="bg-cyan-500 text-white px-6 py-3 rounded hover:bg-cyan-600 transition"
          >
            Go Back to Upload
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Simple color compatibility check
  const compatibleColors = {
    Blue: ["Black", "White", "Beige", "Neutral"],
    Red: ["Black", "White", "Neutral"],
    White: ["Black", "Blue", "Red", "Beige", "Neutral"],
    Black: ["Blue", "Red", "White", "Beige", "Neutral"],
    Beige: ["Blue", "White", "Black", "Neutral"],
    Neutral: ["Blue", "Red", "White", "Black", "Beige", "Neutral"],
  };

  const detectColor = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("blue")) return "Blue";
    if (name.includes("red")) return "Red";
    if (name.includes("white")) return "White";
    if (name.includes("black")) return "Black";
    if (name.includes("beige")) return "Beige";
    return "Neutral";
  };

  const shirtColor = detectColor(images.shirt);
  const pantsColor = detectColor(images.pants);
  const shoesColor = detectColor(images.shoes);

  const isCompatible =
    compatibleColors[shirtColor]?.includes(pantsColor) &&
    compatibleColors[shirtColor]?.includes(shoesColor);

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
                Detected color:{" "}
                {type === "shirt"
                  ? shirtColor
                  : type === "pants"
                  ? pantsColor
                  : shoesColor}
              </p>
            </div>
          ))}
        </div>

        {/* Compatibility Result */}
        <div
          className={`text-center p-6 rounded-xl shadow mb-8 ${
            isCompatible
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">Compatibility Check</h2>
          <p className="text-lg">
            {isCompatible
              ? "✅ Your outfit colors are compatible!"
              : "⚠️ Colors may not match perfectly."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
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
