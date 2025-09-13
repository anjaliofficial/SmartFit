// src/pages/OutfitDetails.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

const OutfitDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.outfit) {
    return (
      <div className="p-6">
        <p>No outfit found.</p>
        <button
          className="bg-cyan-500 text-white px-4 py-2 rounded mt-4"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const outfit = state.outfit;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6">{outfit.name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {outfit.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <img
                src={item.img}
                alt={item.type}
                className="w-full h-64 object-contain mb-4"
              />
              <p className="text-gray-700 font-semibold">{item.type}</p>
              <p className="text-gray-500">{item.color}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition"
            onClick={() => alert("Wear Again clicked!")}
          >
            Wear Again
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            onClick={() => alert("Save Outfit clicked!")}
          >
            Save Outfit
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OutfitDetails;
