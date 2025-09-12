import React, { useState, useRef } from "react";
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

  const thumbnailRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

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

  // Thumbnail drag handlers
  const handleMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - thumbnailRef.current.offsetLeft;
    scrollLeft = thumbnailRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDown = false;
  };
  const handleMouseUp = () => {
    isDown = false;
  };
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - thumbnailRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    thumbnailRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Fullscreen main container */}
      <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left: Outfit Images */}
        <div className="md:w-2/3 w-full bg-gray-800 flex flex-col items-center justify-center p-4 relative">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
            >
              ← Back
            </button>
          </div>

          <div className="relative overflow-hidden rounded-lg w-full max-h-[80vh] shadow-2xl">
            <img
              src={selectedImage}
              alt={outfit.name}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
          </div>

          {/* Scrollable Thumbnails */}
          <div
            ref={thumbnailRef}
            className="flex space-x-4 overflow-x-auto w-full py-4 cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {outfit.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${outfit.name} ${idx + 1}`}
                className={`w-28 h-28 object-contain rounded-lg cursor-pointer border ${
                  selectedImage === img ? "border-cyan-400" : "border-gray-600"
                } hover:scale-110 transform transition`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right: Outfit Info & Actions */}
        <div className="md:w-1/3 w-full bg-gray-900 p-8 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">{outfit.name}</h2>
          <p className="text-gray-300 mb-6">{outfit.description}</p>

          <div className="flex gap-4 mb-10">
            <button className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition">
              Wear This Outfit
            </button>
            <button className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 transition">
              Save to Favorites
            </button>
          </div>

          <h3 className="text-2xl font-bold mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 gap-4">
            {suggested.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-xl transition flex items-center p-2"
                onClick={() => navigate(`/outfit/${item.id}`)}
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-lg mr-3"
                />
                <span className="font-semibold text-gray-100">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitDetails;
