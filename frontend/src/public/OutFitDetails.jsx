import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Example images
import fav1 from "../assets/image/fav1.jpg";
import fav2 from "../assets/image/fav2.jpg";
import fav3 from "../assets/image/fav3.jpg";
import fav4 from "../assets/image/fav4.jpg";

const outfitData = [
  {
    id: 1,
    images: [fav1, fav2, fav3],
    name: "Classic Casual",
    description: "Blazer + Jeans + Sneakers. Perfect for casual Fridays.",
  },
  {
    id: 2,
    images: [fav2, fav3, fav4],
    name: "Party Night",
    description: "Glitter top + Skirt + Heels. Shine all night.",
  },
  {
    id: 3,
    images: [fav3, fav4, fav1],
    name: "Summer Dress",
    description: "Floral dress + Sandals. Stay cool & stylish.",
  },
  {
    id: 4,
    images: [fav4, fav1, fav2],
    name: "Winter Layers",
    description: "Cozy sweater + Jacket + Boots. Warm & chic.",
  },
];

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outfit = outfitData.find((item) => item.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState(
    outfit ? outfit.images[0] : null
  );

  if (!outfit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-3xl font-bold mb-4">Outfit Not Found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-3 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const suggested = outfitData.filter((item) => item.id !== outfit.id);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fullscreen main container */}
      <div className="relative w-full h-screen flex flex-col md:flex-row">
        {/* Left: Outfit Images */}
        <div className="md:w-2/3 w-full bg-white flex flex-col items-center justify-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back
          </button>

          <img
            src={selectedImage}
            alt={outfit.name}
            className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg mb-4"
          />

          {/* Scrollable Thumbnails */}
          <div className="flex space-x-4 overflow-x-auto w-full py-2">
            {outfit.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${outfit.name} ${idx + 1}`}
                className={`w-28 h-28 object-contain rounded-lg cursor-pointer border ${
                  selectedImage === img ? "border-cyan-500" : "border-gray-300"
                } hover:scale-105 transform transition`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right: Outfit Info & Actions */}
        <div className="md:w-1/3 w-full bg-gray-50 p-6 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">{outfit.name}</h2>
          <p className="text-gray-700 mb-6">{outfit.description}</p>

          <div className="flex gap-4 mb-10">
            <button className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded hover:bg-cyan-600">
              Wear This Outfit
            </button>
            <button className="flex-1 px-4 py-3 bg-gray-200 rounded hover:bg-gray-300">
              Save to Favorites
            </button>
          </div>

          <h3 className="text-2xl font-bold mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
            {suggested.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition flex items-center p-2"
                onClick={() => navigate(`/outfit/${item.id}`)}
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-lg mr-3"
                />
                <span className="font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitDetails;
