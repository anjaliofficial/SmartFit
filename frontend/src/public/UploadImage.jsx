<<<<<<< HEAD
// frontend/src/UploadPage.jsx
import React, { useState, useRef } from "react";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

export default function UploadPage() {
  const [facePhoto, setFacePhoto] = useState(null);
  const [skinTone, setSkinTone] = useState("");
  const [clothes, setClothes] = useState({
    shirt: [],
    pants: [],
    shoes: [],
    top: [],
    bottom: [],
    outerwear: [],
    dress: [],
    skirt: [],
  });
  const [occasion, setOccasion] = useState("Casual Outing");
  const [recommendations, setRecommendations] = useState({});
  const [maxPerCategory] = useState(2);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const BACKEND_URL = "http://127.0.0.1:5001"; // <-- Make sure this matches your Flask port

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error("Camera error:", err);
      alert(
        "Cannot access camera. Check permissions or try a different browser."
      );
=======
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
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
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

<<<<<<< HEAD
  // Capture photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return alert("Camera not started");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return alert("Failed to capture image");
        const file = new File([blob], `face_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setFacePhoto(file);
      },
      "image/jpeg",
      0.9
    );
  };

  // Detect skin tone
  const detectSkinTone = async () => {
    if (!facePhoto) return alert("Capture a photo first");
    const form = new FormData();
    form.append("file_face", facePhoto);

    try {
      const res = await fetch(`${BACKEND_URL}/detect_skin`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await res.json();
      setSkinTone(data.skin_tone);
    } catch (err) {
      console.error(err);
      alert("Failed to detect skin tone. Check backend server and URL.");
    }
  };

  // Handle clothing file upload
  const handleFileChange = (category, files) => {
    const selectedFiles = Array.from(files);
    if (clothes[category].length + selectedFiles.length > maxPerCategory) {
      alert(`Maximum ${maxPerCategory} files allowed for ${category}`);
=======
  const handleAnalyze = () => {
    if (!images.shirt || !images.pants || !images.shoes) {
      alert("Please upload at least shirt, pants, and shoes!");
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
      return;
    }
    setClothes((prev) => ({
      ...prev,
      [category]: [...prev[category], ...selectedFiles],
    }));
  };

<<<<<<< HEAD
  // Remove file
  const removeFile = (category, index) => {
    setClothes((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  // Render previews
  const renderPreview = (files, category) =>
    files.map((file, i) => (
      <div key={i} className="relative mr-3 mb-3">
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="w-36 h-36 rounded-lg object-cover border shadow-md"
        />
        <button
          onClick={() => removeFile(category, i)}
          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-full shadow"
        >
          ✕
        </button>
      </div>
    ));

  // Analyze outfit
  const handleAnalyze = async () => {
    if (!facePhoto) {
      alert("Capture your face photo first.");
      return;
    }

    const form = new FormData();
    form.append("file_face", facePhoto);
    form.append("occasion", occasion);

    Object.keys(clothes).forEach((cat) => {
      clothes[cat].forEach((f) => form.append(`file_${cat}`, f));
    });

    try {
      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await res.json();
      setRecommendations(data);
      if (data.skin_tone) setSkinTone(data.skin_tone);
    } catch (err) {
      console.error("Failed to analyze:", err);
      alert("Failed to analyze outfit. Check backend server and URL.");
    }
  };

  // Render upload sections dynamically
  const renderUploadSections = () => {
    const categories = [
      "shirt",
      "pants",
      "shoes",
      "top",
      "bottom",
      "outerwear",
      "dress",
      "skirt",
    ];
    return categories.map((cat) => (
      <div key={cat} className="mb-4">
        <label className="block font-medium mb-1">
          {cat.charAt(0).toUpperCase() + cat.slice(1)} (max {maxPerCategory})
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(cat, e.target.files)}
        />
        <div className="flex flex-wrap mt-3">
          {renderPreview(clothes[cat], cat)}
=======
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
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
        </div>
      </div>
    ));
  };

<<<<<<< HEAD
  const occasionOptions = [
    "Casual Outing",
    "Wedding/Poosa",
    "College",
    "Bar",
    "Mountain",
    "Beach",
    "Temple",
    "Office",
    "Gym",
    "Party",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 p-6 max-w-5xl mx-auto">
        {/* Camera Section */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-3">Step 1 — Capture your face</h2>
          <video
            ref={videoRef}
            className="w-80 h-60 border rounded-lg mb-3"
            autoPlay
            playsInline
          />
          <div className="flex flex-wrap gap-3 mb-3">
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Camera
            </button>
            <button
              onClick={capturePhoto}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Capture Photo
            </button>
            <button
              onClick={detectSkinTone}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              Detect Skin Tone
            </button>
          </div>
          {skinTone && (
            <p className="font-semibold">Detected skin tone: {skinTone}</p>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {facePhoto && (
            <div className="mt-3">
              <p className="text-sm font-medium">Captured photo preview:</p>
              <img
                src={URL.createObjectURL(facePhoto)}
                alt="face"
                className="w-40 h-40 object-cover rounded-lg mt-2 shadow-md"
              />
            </div>
          )}
        </section>

        {/* Occasion Selection */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-3">Step 2 — Select Occasion</h2>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
          >
            {occasionOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </section>

        {/* Clothing Upload */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-3">
            Step 3 — Upload clothing items
          </h2>
          {renderUploadSections()}
        </section>

        {/* Analyze Button */}
        <div className="flex justify-center mb-6">
=======
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
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
          <button
            onClick={handleAnalyze}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            Analyze Outfit
          </button>
        </div>
<<<<<<< HEAD

        {/* Recommendations */}
        {recommendations && (
          <section className="mb-6 space-y-6">
            {recommendations.combined_preview && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2">Top outfit preview</h3>
                <img
                  src={`${BACKEND_URL}/uploads/${recommendations.combined_preview}`}
                  alt="combined"
                  className="w-full max-w-3xl h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {recommendations.recommended_colors && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2">Recommended colors</h3>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {recommendations.recommended_colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 rounded-lg border flex items-center justify-center text-sm font-bold text-white shadow-md"
                      style={{ backgroundColor: c.toLowerCase() }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.recommended_accessories && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2">
                  Accessory suggestions
                </h3>
                <ul className="list-disc pl-5 mt-2">
                  {recommendations.recommended_accessories.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.recommended_outfits && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-2">Recommended outfits</h3>
                <div className="mt-2 space-y-3">
                  {recommendations.recommended_outfits.map((o, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-50 rounded-lg shadow-md"
                    >
                      <p>
                        <strong>Score:</strong> {o.score} — {o.feedback}
                      </p>
                      <p>
                        <strong>Items:</strong> {o.items.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
=======
>>>>>>> 03b2b20dc939ec7eba88440d1c9053b1cb50c7e7
      </main>
      <Footer />
    </div>
  );
}
