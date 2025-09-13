import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

// Example outfits (replace with backend/localStorage later)
import outfit1 from "../assets/image/fav1.jpg";
import outfit2 from "../assets/image/fav2.jpg";
import outfit3 from "../assets/image/fav3.jpg";
import outfit4 from "../assets/image/fav4.jpg";

const SavedOutfits = () => {
  const navigate = useNavigate();

  const [savedOutfits, setSavedOutfits] = useState([
    { id: 1, name: "Casual Look", img: outfit1 },
    { id: 2, name: "Office Wear", img: outfit2 },
    { id: 3, name: "Party Outfit", img: outfit3 },
    { id: 4, name: "Traditional Look", img: outfit4 },
  ]);

  // Add new outfit
  const handleSaveOutfit = () => {
    const newId = savedOutfits.length + 1;
    const newOutfit = {
      id: newId,
      name: `New Outfit ${newId}`,
      img: outfit1, // default image, can replace later
    };
    setSavedOutfits([...savedOutfits, newOutfit]);
  };

  // Remove outfit
  const handleRemoveOutfit = (id) => {
    setSavedOutfits(savedOutfits.filter((outfit) => outfit.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-cyan-50">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold text-center text-cyan-600 mb-10">
          Your Saved Outfits
        </h1>

        {/* Save Outfit Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleSaveOutfit}
            className="bg-cyan-500 text-white px-6 py-3 rounded-xl hover:bg-cyan-600 shadow transition"
          >
            + Save New Outfit
          </button>
        </div>

        {/* Saved Outfits Grid */}
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition transform hover:scale-105"
              >
                <img
                  src={outfit.img}
                  alt={outfit.name}
                  className="w-full h-80 object-contain bg-gray-100 rounded-t-xl"
                />
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg">{outfit.name}</h3>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition"
                      onClick={() => navigate(`/outfit/${outfit.id}`)}
                    >
                      Wear This
                    </button>
                    <button
                      className="flex-1 border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50 transition"
                      onClick={() => handleRemoveOutfit(outfit.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            You don’t have any saved outfits yet. Start saving now!
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedOutfits;
