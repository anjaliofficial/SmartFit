// src/pages/AnalysisPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const images = location.state?.images;

  if (!images) {
    // Redirect if no images provided
    navigate("/upload");
    return null;
  }

  // Dummy analysis results
  const analysisResults = {
    colorMatch: "Good ✅",
    styleMatch: "Casual / Formal Compatible",
    suggestions: [
      "Try brown shoes instead of black",
      "Blue shirt fits better with grey pants",
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-100 p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
          Outfit Analysis & Recommendations
        </h1>

        {/* Uploaded Images Preview */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Uploaded Outfit</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {["shirt", "pants", "shoes"].map((type) => (
              <div key={type} className="flex flex-col items-center">
                <img
                  src={images[type]}
                  alt={type}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <span className="capitalize mt-2">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <p>
            <strong>Color Match:</strong> {analysisResults.colorMatch}
          </p>
          <p>
            <strong>Style Match:</strong> {analysisResults.styleMatch}
          </p>
          <p className="mt-2">
            <strong>Suggestions:</strong>
          </p>
          <ul className="list-disc list-inside">
            {analysisResults.suggestions.map((sug, index) => (
              <li key={index}>{sug}</li>
            ))}
          </ul>
        </div>

        {/* Back / Save Buttons */}
        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => navigate("/upload")}
            className="bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600 transition"
          >
            Back
          </button>
          <button
            onClick={() => alert("Outfit saved!")}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
          >
            Save Outfit
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalysisPage;
