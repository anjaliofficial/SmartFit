import React from "react";
import { useParams, useNavigate } from "react-router-dom";

// Example images (reuse your favorites or other outfits)
import fav1 from "../assets/image/fav1.jpg";
import fav2 from "../assets/image/fav2.jpg";
import fav3 from "../assets/image/fav3.jpg";
import fav4 from "../assets/image/fav4.jpg";

const outfitData = [
  {
    id: 1,
    img: fav1,
    name: "Classic Casual",
    description: "Blazer + Jeans + Sneakers. Perfect for casual Fridays.",
  },
  {
    id: 2,
    img: fav2,
    name: "Party Night",
    description: "Glitter top + Skirt + Heels. Shine all night.",
  },
  {
    id: 3,
    img: fav3,
    name: "Summer Dress",
    description: "Floral dress + Sandals. Stay cool & stylish.",
  },
  {
    id: 4,
    img: fav4,
    name: "Winter Layers",
    description: "Cozy sweater + Jacket + Boots. Warm & chic.",
  },
];

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const outfit = outfitData.find((item) => item.id === parseInt(id));

  if (!outfit) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Outfit Not Found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
        <img
          src={outfit.img}
          alt={outfit.name}
          className="w-full h-96 object-contain mb-6 bg-gray-100"
        />
        <h2 className="text-3xl font-bold mb-2">{outfit.name}</h2>
        <p className="text-gray-700 mb-4">{outfit.description}</p>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
          Wear This Outfit
        </button>
      </div>
    </div>
  );
};

export default OutfitDetails;
