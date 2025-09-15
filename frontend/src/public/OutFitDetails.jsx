// src/pages/OutfitDetails.jsx
import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";
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

  // Fetch outfit from context savedOutfits or fallback favorites
  const outfit =
    savedOutfits.find((f) => f.id.toString() === id) ||
    favoriteOutfits.find((f) => f.id === id);

  if (!outfit) {
    return (
      <div className="p-6">
        <p className="text-gray-700">No outfit found.</p>
        <button
          className="bg-cyan-500 text-white px-4 py-2 rounded mt-4"
          onClick={() => navigate("/")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = () => {
    // Prevent duplicate saves
    if (!savedOutfits.some((o) => o.id === outfit.id)) {
      saveOutfit(outfit);
      alert("Outfit saved to favorites!");
    } else {
      alert("This outfit is already in your favorites!");
    }
  };

  const handleWear = () => {
    alert("You're wearing this outfit today! 👗👕👖👟");
  };

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
            onClick={handleWear}
          >
            Wear Again
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            onClick={handleSave}
          >
            Save Outfit
          </button>
          <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OutfitDetails;
