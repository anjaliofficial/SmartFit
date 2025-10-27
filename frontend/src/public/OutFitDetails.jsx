// src/pages/OutfitDetails.jsx
import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";
import { SavedOutfitsContext } from "../context/SavedOutfitsContext";

// Example static favorites
import fav1 from "../assets/image/fav1.jpg";
import fav2 from "../assets/image/fav2.jpg";
import fav3 from "../assets/image/fav3.jpg";
import fav4 from "../assets/image/fav4.jpg";

const favoriteOutfits = [
  {
    id: "fav-1",
    name: "Classic Casual",
    items: [{ img: fav1, type: "Shirt", color: "Blue" }],
  },
  {
    id: "fav-2",
    name: "Party Night",
    items: [{ img: fav2, type: "Dress", color: "Red" }],
  },
  {
    id: "fav-3",
    name: "Summer Dress",
    items: [{ img: fav3, type: "Dress", color: "White" }],
  },
  {
    id: "fav-4",
    name: "Winter Layers",
    items: [{ img: fav4, type: "Jacket", color: "Black" }],
  },
];

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedOutfits, saveOutfit } = useContext(SavedOutfitsContext);

  const outfit =
    savedOutfits.find((f) => f.id.toString() === id) ||
    favoriteOutfits.find((f) => f.id === id);

  if (!outfit) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-50 p-6">
        <h2 className="text-xl text-gray-600 mb-4">No outfit found 🕵️‍♀️</h2>
        <button
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-3 rounded-lg shadow hover:opacity-90 transition"
          onClick={() => navigate("/")}
        >
          ⬅️ Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (!savedOutfits.some((o) => o.id === outfit.id)) {
      saveOutfit(outfit);
      alert("✅ Outfit saved to favorites!");
    } else {
      alert("⚠️ This outfit is already in your favorites!");
    }
  };

  const handleWear = () => {
    alert("👗 You’re wearing this outfit today!");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              {outfit.name}
            </h1>
            <p className="text-gray-500 mt-2">
              Handpicked style just for you ✨
            </p>
          </div>

          {/* Outfit Items */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            {outfit.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center"
              >
                <img
                  src={item.img}
                  alt={item.type}
                  className="w-full h-64 object-contain rounded-xl mb-4"
                />
                <p className="text-gray-800 font-semibold">{item.type}</p>
                <p className="text-gray-500 text-sm">{item.color}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={handleWear}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              👕 Wear Again
            </button>
            <button
              onClick={handleSave}
              className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-100 transition"
            >
              💖 Save Outfit
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              ⬅️ Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OutfitDetails;
