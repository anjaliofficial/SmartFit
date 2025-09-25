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
    }
  };

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
      const res = await fetch("http://127.0.0.1:5000/detect_skin", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Skin detection failed");
      }
      const data = await res.json();
      setSkinTone(data.skin_tone);
    } catch (err) {
      console.error(err);
      alert(`Failed to detect skin tone: ${err.message}`);
    }
  };

  // Handle clothing file upload with max limit
  const handleFileChange = (category, files) => {
    const selectedFiles = Array.from(files);
    if (clothes[category].length + selectedFiles.length > maxPerCategory) {
      alert(`Maximum ${maxPerCategory} files allowed for ${category}`);
      return;
    }
    setClothes((prev) => ({
      ...prev,
      [category]: [...prev[category], ...selectedFiles],
    }));
  };

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
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        // Parse the error message from the backend
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setRecommendations(data);
      if (data.skin_tone) {
        setSkinTone(data.skin_tone);
      }
    } catch (err) {
      console.error("Failed to analyze:", err);
      alert(`Failed to analyze: ${err.message}`);
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
        </div>
      </div>
    ));
  };

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
          <div className="mb-4">
            <label htmlFor="occasion-select" className="block font-medium mb-1">
              Where will you wear this?
            </label>
            <select
              id="occasion-select"
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
          </div>
        </section>

        {/* Clothing Upload Section */}
        <section className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-3">
            Step 3 — Upload clothing items
          </h2>
          {renderUploadSections()}
        </section>

        {/* Analyze Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAnalyze}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            Analyze Outfit
          </button>
        </div>

        {/* Recommendations Section */}
        <section className="mb-6">
          {recommendations.combined_preview && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-2">Top outfit preview</h3>
              <img
                src={`http://127.0.0.1:5000/uploads/${recommendations.combined_preview}`}
                alt="combined"
                className="w-full max-w-3xl h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {recommendations.recommended_colors && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
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
            <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-2">Accessory suggestions</h3>
              <ul className="list-disc pl-5 mt-2">
                {recommendations.recommended_accessories.map((acc, i) => (
                  <li key={i}>{acc}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.recommended_outfits && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-2">Recommended outfits</h3>
              <div className="mt-2 space-y-3">
                {recommendations.recommended_outfits.map((o, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg shadow-md">
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
      </main>

      <Footer />
    </div>
  );
}
