// src/pages/UploadPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

const UploadPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState({
    shirt: null,
    pants: null,
    shoes: null,
  });

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setImages({ ...images, [type]: URL.createObjectURL(file) });
    }
  };

  const handleAnalyze = () => {
    if (!images.shirt || !images.pants || !images.shoes) {
      alert("Please upload all 3 items: shirt, pants, and shoes!");
      return;
    }
    navigate("/outfitanalysis", { state: { images } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Upload Your Outfit
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["shirt", "pants", "shoes"].map((type) => (
            <div
              key={type}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <h2 className="capitalize text-xl font-semibold mb-4">{type}</h2>

              {images[type] ? (
                <img
                  src={images[type]}
                  alt={type}
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <p className="text-gray-500">No {type} image</p>
                </div>
              )}

              <label className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, type)}
                  className="hidden"
                />
                <div className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-center cursor-pointer">
                  Upload {type}
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleAnalyze}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold transition"
          >
            Analyze Outfit
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
