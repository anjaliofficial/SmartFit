import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

// Import suggestion & favorite images
import casualImage from "../assets/image/casual.jpg";
import summerImage from "../assets/image/summer.jpg";
import fav1 from "../assets/image/fav1.jpg";
import fav2 from "../assets/image/fav2.jpg";
import fav3 from "../assets/image/fav3.jpg";
import fav4 from "../assets/image/fav4.jpg";

import { FaTshirt, FaBoxOpen, FaStar } from "react-icons/fa";
import { MdCheckroom } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();

  // Favorites
  const favorites = [
    { id: 1, img: fav1, name: "Classic Casual" },
    { id: 2, img: fav2, name: "Party Night" },
    { id: 3, img: fav3, name: "Summer Dress" },
    { id: 4, img: fav4, name: "Winter Layers" },
  ];

  // Multi-upload state
  const [items, setItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: "Unknown", // Later: AI detection
    }));
    setItems((prev) => [...prev, ...newItems]);
    setShowPreview(false);
  };

  const handleAnalyze = () => {
    if (items.length === 0) {
      alert("Please upload some items first!");
      return;
    }
    setShowPreview(true);
  };

  return (
    <>
      <Header />

      <div className="font-sans text-gray-800 bg-gray-50 min-h-screen p-4 md:p-8">
        {/* Welcome Section */}
        <section className="bg-cyan-100 p-6 rounded-xl shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-2">👋 Welcome back, Anjali!</h1>
          <p className="text-gray-700 text-lg">
            Upload your clothing items and see smart outfit suggestions.
          </p>
        </section>

        {/* ================== UPLOAD IMAGES SECTION ================== */}
        <section className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">Upload Clothing Items</h2>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-cyan-500 transition">
            <p className="text-gray-500 mb-2">
              Drag & drop your images here, or click to upload
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="cursor-pointer"
            />
          </div>

          {/* Uploaded Images Preview (Scrollable Grid) */}
          {items.length > 0 && (
            <div className="overflow-x-auto py-2">
              <div className="flex gap-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 rounded-xl shadow p-2 flex-shrink-0 w-48 flex flex-col items-center"
                  >
                    <img
                      src={item.preview}
                      alt={`Item ${idx}`}
                      className="w-full h-48 object-contain mb-2"
                    />
                    <p className="text-sm font-semibold">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Outfit Button */}
          <div className="flex justify-center mt-6">
            <button
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-cyan-600 transition"
              onClick={handleAnalyze}
            >
              Analyze Outfit
            </button>
          </div>
        </section>

        {/* ================== VIRTUAL OUTFIT PREVIEW ================== */}
        {showPreview && (
          <section className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Suggested Outfit Preview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-xl shadow p-2 flex flex-col items-center"
                >
                  <img
                    src={item.preview}
                    alt={`Preview ${idx}`}
                    className="w-full h-48 object-contain mb-2"
                  />
                  <p className="text-sm font-semibold">{item.type}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-600">
              This is a suggested combination of your uploaded items.
            </p>
          </section>
        )}

        {/* ================== STATS ================== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center hover:scale-105 transform transition">
            <FaTshirt className="text-cyan-500 text-4xl mb-2" />
            <h2 className="text-2xl font-bold">120</h2>
            <p className="text-gray-600">Outfits Added</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center hover:scale-105 transform transition">
            <FaBoxOpen className="text-cyan-500 text-4xl mb-2" />
            <h2 className="text-2xl font-bold">350</h2>
            <p className="text-gray-600">Closet Items</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center hover:scale-105 transform transition">
            <MdCheckroom className="text-cyan-500 text-4xl mb-2" />
            <p className="text-sm text-gray-600">Last Fit Checked</p>
            <button className="mt-3 text-sm bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition">
              Re-try this Fit
            </button>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center hover:scale-105 transform transition">
            <FaStar className="text-cyan-500 text-4xl mb-2" />
            <h2 className="text-2xl font-bold">45</h2>
            <p className="text-gray-600">Favorites Saved</p>
          </div>
        </section>

        {/* ================== FAVORITES ================== */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Favorites Highlight</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer transition transform hover:scale-105"
                onClick={() => navigate(`/outfit/${fav.id}`)}
              >
                <img
                  src={fav.img}
                  alt={fav.name}
                  className="w-full h-80 object-contain bg-gray-100"
                />
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg">{fav.name}</h3>
                  <button
                    className="mt-3 w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded hover:bg-cyan-50 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`You selected ${fav.name}!`);
                    }}
                  >
                    Wear Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Dashboard;
