// src/pages/OutfitRecommendationPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

const OutfitRecommendationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { images } = location.state || {};

  if (!images) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 p-6">
          <p className="text-lg text-gray-700 mb-4">No outfit selected.</p>
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

  // ==========================
  // Helper functions
  // ==========================
  const detectColor = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("blue")) return "Blue";
    if (name.includes("red")) return "Red";
    if (name.includes("white")) return "White";
    if (name.includes("black")) return "Black";
    if (name.includes("beige")) return "Beige";
    return "Neutral";
  };

  const detectStyle = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("shirt") || name.includes("blazer")) return "Formal";
    if (name.includes("tshirt") || name.includes("jeans")) return "Casual";
    if (name.includes("sneaker") || name.includes("tracksuit")) return "Sporty";
    return "Casual";
  };

  const detectPattern = (fileName) => {
    const name = fileName?.toLowerCase() || "";
    if (name.includes("stripe")) return "Stripes";
    if (name.includes("check")) return "Checks";
    if (name.includes("dot") || name.includes("floral")) return "Print";
    return "Solid";
  };

  // ==========================
  // Extract colors, styles, patterns
  // ==========================
  const shirtColor = detectColor(images.shirt);
  const pantsColor = detectColor(images.pants);
  const shoesColor = detectColor(images.shoes);

  const shirtStyle = detectStyle(images.shirt);
  const pantsStyle = detectStyle(images.pants);
  const shoesStyle = detectStyle(images.shoes);

  const shirtPattern = detectPattern(images.shirt);
  const pantsPattern = detectPattern(images.pants);
  const shoesPattern = detectPattern(images.shoes);

  // ==========================
  // Dynamic suggestions
  // ==========================
  const suggestions = [];

  // Color suggestions
  if (shirtColor === "Red" && pantsColor === "Brown") {
    suggestions.push("Try black pants instead of brown.");
  }
  if (shoesColor === "White" && shirtColor === "Formal") {
    suggestions.push("Consider formal shoes to match the shirt.");
  }

  // Style suggestions
  if (shirtStyle !== pantsStyle) {
    suggestions.push(
      `Your ${shirtStyle.toLowerCase()} shirt might not match ${pantsStyle.toLowerCase()} pants.`
    );
  }

  // Pattern suggestions
  if (
    shirtPattern !== "Solid" &&
    pantsPattern !== "Solid" &&
    shirtPattern !== pantsPattern
  ) {
    suggestions.push("Mixing patterns may clash; consider solid items.");
  }

  // Default suggestion if empty
  if (suggestions.length === 0) {
    suggestions.push("Your outfit looks great! No major improvements needed.");
  }

  // Occasion suggestions based on style
  const occasions = [];
  if (shirtStyle === "Formal" || pantsStyle === "Formal")
    occasions.push("Office");
  if (shirtStyle === "Casual" || pantsStyle === "Casual")
    occasions.push("Casual");
  if (shirtStyle === "Sporty" || pantsStyle === "Sporty")
    occasions.push("Sports");
  occasions.push("Party"); // always suggest party

  const fitScore = suggestions.some(
    (s) => s.includes("might") || s.includes("clash")
  )
    ? "⚠️"
    : "✅";

  const getIcon = (score) => {
    if (score === "✅")
      return <FaCheckCircle className="inline text-green-600 mr-2" />;
    if (score === "⚠️")
      return <FaExclamationTriangle className="inline text-yellow-600 mr-2" />;
    return <FaTimesCircle className="inline text-red-600 mr-2" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow p-6 md:p-12 space-y-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Outfit Recommendations
        </h1>

        {/* Fit Rating */}
        <div className="text-center p-6 rounded-xl shadow text-2xl font-semibold bg-gray-50">
          {getIcon(fitScore)} Fit Rating:{" "}
          {fitScore === "✅" ? "Good combo!" : "Might not match"}
        </div>

        {/* Alternative Suggestions */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-3">Alternative Combinations</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Occasion Recommendations */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-3">Occasion Recommendations</h2>
          <div className="flex flex-wrap gap-4">
            {occasions.map((occ, i) => (
              <span
                key={i}
                className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full font-medium"
              >
                {occ}
              </span>
            ))}
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

export default OutfitRecommendationPage;
