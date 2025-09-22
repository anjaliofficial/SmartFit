// src/pages/UploadPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

const UploadPage = () => {
  const navigate = useNavigate();

  const outfitCategories = [
    "shirt",
    "pants",
    "shoes",
    "jacket",
    "accessories",
    "bag",
  ];

  const [images, setImages] = useState(
    outfitCategories.reduce((acc, item) => ({ ...acc, [item]: null }), {})
  );
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(
    outfitCategories.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );
  const [warnings, setWarnings] = useState(
    outfitCategories.reduce((acc, item) => ({ ...acc, [item]: null }), {})
  );

  // ----------------------- Quality Checks -----------------------
  const getBrightness = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return total / (data.length / 4);
  };

  const isBlurry = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let mean = 0;
    const gray = [];
    for (let i = 0; i < data.length; i += 4) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray.push(g);
      mean += g;
    }
    mean /= gray.length;
    let variance = 0;
    gray.forEach((g) => (variance += (g - mean) ** 2));
    variance /= gray.length;
    return variance < 100;
  };

  // ----------------------- Handle Selection -----------------------
  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));

    // show preview immediately
    const url = URL.createObjectURL(file);
    setImages((prev) => ({ ...prev, [type]: url }));
    setWarnings((prev) => ({ ...prev, [type]: null }));
  };

  const handleReset = (type) => {
    setSelectedFiles((prev) => ({ ...prev, [type]: null }));
    setImages((prev) => ({ ...prev, [type]: null }));
    setWarnings((prev) => ({ ...prev, [type]: null }));
  };

  // ----------------------- Upload All Selected -----------------------
  const handleUploadAll = async () => {
    const entries = Object.entries(selectedFiles);
    if (!entries.length) return;

    const uploadPromises = entries.map(async ([type, file]) => {
      setUploading((prev) => ({ ...prev, [type]: true }));
      setWarnings((prev) => ({ ...prev, [type]: null }));

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await img.decode();

      const brightness = getBrightness(img);
      if (brightness < 60) {
        setWarnings((prev) => ({ ...prev, [type]: "Too dark" }));
        setUploading((prev) => ({ ...prev, [type]: false }));
        return;
      }

      if (isBlurry(img)) {
        setWarnings((prev) => ({ ...prev, [type]: "Blurry image" }));
        setUploading((prev) => ({ ...prev, [type]: false }));
        return;
      }

      try {
        const formData = new FormData();
        formData.append(type, file);
        formData.append("userId", "USER_ID_HERE"); // replace with auth if needed

        const res = await fetch("http://localhost:5000/api/outfits/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          setImages((prev) => ({
            ...prev,
            [type]: `http://localhost:5000${data.data[type]}`,
          }));
        } else {
          setWarnings((prev) => ({ ...prev, [type]: "Upload failed" }));
        }
      } catch (err) {
        console.error(err);
        setWarnings((prev) => ({ ...prev, [type]: "Upload error" }));
      } finally {
        setUploading((prev) => ({ ...prev, [type]: false }));
      }
    });

    await Promise.all(uploadPromises);
    setSelectedFiles({});
  };

  const handleAnalyze = () => {
    if (!images.shirt || !images.pants || !images.shoes) {
      alert("Please upload at least shirt, pants, and shoes!");
      return;
    }
    navigate("/outfitanalysis", { state: { images } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Upload Your Outfit
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {outfitCategories.map((type) => (
            <div
              key={type}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center relative"
            >
              <h2 className="capitalize text-xl font-semibold mb-4">{type}</h2>

              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4 relative border">
                {images[type] ? (
                  <img
                    src={images[type]}
                    alt={type}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500">No {type} image</p>
                )}

                {uploading[type] && (
                  <p className="absolute text-sm text-gray-500">
                    Processing...
                  </p>
                )}
                {warnings[type] && (
                  <p className="absolute text-red-500 font-semibold">
                    {warnings[type]}
                  </p>
                )}
              </div>

              <div className="flex gap-2 w-full">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, type)}
                    className="hidden"
                  />
                  <div className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-center">
                    Select
                  </div>
                </label>

                {images[type] && (
                  <button
                    onClick={() => handleReset(type)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upload All Selected Button (always visible) */}
        <div className="mt-6 text-center">
          <button
            onClick={handleUploadAll}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 font-semibold transition"
          >
            Upload All Selected
          </button>
        </div>

        {/* Final Outfit Preview */}
        {(images.shirt || images.pants || images.shoes) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              Final Outfit Preview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-center items-center bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
              {outfitCategories.map(
                (item) =>
                  images[item] && (
                    <div key={item} className="flex flex-col items-center mb-4">
                      <img
                        src={images[item]}
                        alt={item}
                        className="w-40 h-40 object-contain rounded-lg border mb-2"
                      />
                      <span className="text-gray-700 font-medium capitalize">
                        {item}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

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
