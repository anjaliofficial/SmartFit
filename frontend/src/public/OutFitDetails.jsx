import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Example favorite outfits data
const favorites = [
  {
    id: 1,
    name: "Classic Casual",
    items: [
      { type: "Shirt", color: "Blue", img: "/assets/image/fav1.jpg" },
      { type: "Pants", color: "Black", img: "/assets/image/fav1.jpg" },
      { type: "Shoes", color: "White", img: "/assets/image/fav1.jpg" },
    ],
  },
  {
    id: 2,
    name: "Party Night",
    items: [
      { type: "Shirt", color: "Red", img: "/assets/image/fav2.jpg" },
      { type: "Pants", color: "Black", img: "/assets/image/fav2.jpg" },
      { type: "Shoes", color: "Black", img: "/assets/image/fav2.jpg" },
    ],
  },
  {
    id: 3,
    name: "Summer Dress",
    items: [
      { type: "Dress", color: "White", img: "/assets/image/fav3.jpg" },
      { type: "Shoes", color: "Beige", img: "/assets/image/fav3.jpg" },
    ],
  },
  {
    id: 4,
    name: "Winter Layers",
    items: [
      { type: "Jacket", color: "Black", img: "/assets/image/fav4.jpg" },
      { type: "Pants", color: "Blue", img: "/assets/image/fav4.jpg" },
      { type: "Shoes", color: "Black", img: "/assets/image/fav4.jpg" },
    ],
  },
];

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const outfit = favorites.find((fav) => fav.id === parseInt(id));

  if (!outfit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Outfit not found!</h1>
        <button
          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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
