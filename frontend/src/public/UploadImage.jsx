// src/pages/UploadPage.jsx
import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { FaUpload, FaTrash, FaRedo } from "react-icons/fa";

const UploadPage = () => {
  const [images, setImages] = useState({
    shirt: null,
    pants: null,
    shoes: null,
  });

  const clothingTypes = ["shirt", "pants", "shoes"];

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setImages({ ...images, [type]: URL.createObjectURL(file) });
    }
  };

  const handleDelete = (type) => {
    setImages({ ...images, [type]: null });
  };

  const handleRetake = (type) => {
    setImages({ ...images, [type]: null });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-100 p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
          Upload Your Outfit
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clothingTypes.map((type) => (
            <div
              key={type}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <h2 className="capitalize text-xl font-semibold mb-4">{type}</h2>

              {/* Preview */}
              {images[type] ? (
                <div className="relative w-full h-48 mb-4">
                  <img
                    src={images[type]}
                    alt={type}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleRetake(type)}
                      className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition"
                      title="Retake"
                    >
                      <FaRedo />
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <p className="text-gray-500">No {type} image</p>
                </div>
              )}

              {/* Upload Button */}
              <label className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition flex items-center gap-2 cursor-pointer">
                <FaUpload /> Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, type)}
                  className="hidden"
                />
              </label>
            </div>
          ))}
        </div>

        {/* Combined Outfit Preview */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Outfit Preview</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {clothingTypes.map((type) => (
              <div key={type} className="flex flex-col items-center">
                {images[type] ? (
                  <img
                    src={images[type]}
                    alt={type}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">{type}</p>
                  </div>
                )}
                <span className="capitalize mt-2">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
