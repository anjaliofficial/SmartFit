import React, { useState, useEffect, useRef } from "react";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";

const BACKEND_URL = "http://127.0.0.1:5001"; // Flask backend

const OutfitSuggestion = () => {
  const [closetItems, setClosetItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Array of indices
  const [suggestion, setSuggestion] = useState([]); // Array of recommended outfit objects
  const [currentIndex, setCurrentIndex] = useState(0);
  const [facePhoto, setFacePhoto] = useState(null);
  const [skinTone, setSkinTone] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load items from local storage
  useEffect(() => {
    // Note: The structure now expects {..., image: 'Base64String', ...}
    const saved = JSON.parse(localStorage.getItem("closetItems")) || [];
    setClosetItems(saved);
  }, []);

  // Helper function to stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- Camera functions ---
  const startCamera = async () => {
    try {
      // Stop any existing stream first
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error("Camera access error:", err);
      alert(
        "Cannot access camera. Check permissions or try a different browser."
      );
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return alert("Camera not started");

    // Ensure video dimensions are valid before setting canvas
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    if (width === 0 || height === 0) return alert("Video stream is not ready.");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop camera after capture
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (!blob) return alert("Failed to capture image");
        setFacePhoto(
          new File([blob], `face_${Date.now()}.jpg`, { type: "image/jpeg" })
        );
      },
      "image/jpeg",
      0.9
    );
  };

  const detectSkinTone = async () => {
    if (!facePhoto) return alert("Capture a photo first");
    const form = new FormData();
    form.append("file_face", facePhoto);

    try {
      const res = await fetch(`${BACKEND_URL}/detect_skin`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSkinTone(data.skin_tone);
      alert(`✅ Skin tone detected: ${data.skin_tone}`);
    } catch (err) {
      console.error("Skin detection error:", err);
      alert("Failed to detect skin tone. Check backend.");
    }
  };

  // --- Outfit suggestion functions ---
  const handleSelect = (i) => {
    if (selectedItems.includes(i))
      setSelectedItems(selectedItems.filter((x) => x !== i));
    else setSelectedItems([...selectedItems, i]);
  };

  const handleSuggest = async () => {
    if (selectedItems.length < 2) return alert("Select at least 2 items!");
    if (!skinTone) return alert("Detect skin tone first!");

    const form = new FormData();

    // 🔥 CRITICAL FIX: Ensure the item data (which includes the Base64 'image' property) is passed
    // The Flask endpoint must be able to handle this JSON string and extract the data it needs.
    selectedItems.forEach((i) =>
      form.append("items", JSON.stringify(closetItems[i]))
    );
    form.append("skin_tone", skinTone);
    // Optional: Add occasion if you include a selector in the UI
    // form.append("occasion", "Casual Outing");

    try {
      const res = await fetch(`${BACKEND_URL}/suggest_outfit`, {
        method: "POST",
        // No Content-Type header needed for FormData
        body: form,
      });
      if (!res.ok)
        throw new Error(
          `HTTP error! status: ${res.status} ${await res.text()}`
        );

      const data = await res.json();

      if (!data.success)
        throw new Error(data.error || "Unknown error from ML service");

      setSuggestion(data.recommended_outfits || []);
      setCurrentIndex(0);

      if ((data.recommended_outfits || []).length === 0) {
        alert(
          "No outfit suggestions could be generated from the selected items."
        );
      }
    } catch (err) {
      console.error("Suggestion generation error:", err);
      alert(`Failed to generate outfit. Error: ${err.message}`);
    }
  };

  const handleNextSuggestion = () => {
    if (suggestion.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % suggestion.length);
  };

  const handleWear = () => {
    if (suggestion.length === 0) return;
    // Save the current suggested outfit items and score
    localStorage.setItem(
      "wearingNow",
      JSON.stringify(suggestion[currentIndex])
    );
    alert("✅ Outfit saved to 'Wearing Now'!");
  };

  const groupedCloset = closetItems.reduce((acc, item, index) => {
    // Note: item.category should be set by MyCloset.js, defaults to 'Others'
    const cat = item.category || "Others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, index });
    return acc;
  }, {});

  // Get the current suggested outfit details
  const currentOutfit = suggestion.length > 0 ? suggestion[currentIndex] : null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-semibold mb-8">🪞 Outfit Suggestion</h1>

          {/* Camera & Skin Tone */}
          <section className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">
              Step 0 — Detect Skin Tone
            </h2>
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                className="w-80 h-60 border rounded-lg mb-3 object-cover"
                autoPlay
                playsInline
                muted // Muted to avoid autoplay issues
              />
            </div>
            <div className="flex flex-wrap gap-3 mb-3 justify-center">
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
              <img
                src={URL.createObjectURL(facePhoto)}
                alt="face"
                className="w-40 h-40 object-cover rounded-lg mx-auto mt-2 shadow-md"
              />
            )}
          </section>

          {/* Closet Items */}
          {Object.keys(groupedCloset).length === 0 ? (
            <p className="text-gray-500 mt-10">
              You haven’t added any clothes yet. Go to <b>My Closet</b> and add
              some! 👚
            </p>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Step 1 — Select Items to Mix & Match 👕👖👠
              </h2>
              {Object.entries(groupedCloset).map(([category, items]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-3 text-left">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    {items.map((item) => (
                      <div
                        key={item.index}
                        onClick={() => handleSelect(item.index)}
                        className={`relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                          selectedItems.includes(item.index)
                            ? "border-cyan-500 scale-105"
                            : "border-transparent hover:shadow-lg"
                        }`}
                      >
                        {/* CRITICAL: Use the main 'image' property which holds the Base64 string */}
                        <img
                          src={item.image || item.images[0]}
                          alt={item.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3 text-left">
                          <h3 className="font-medium text-gray-800 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.color || "—"} • {item.occasion || ""}
                          </p>
                        </div>
                        {selectedItems.includes(item.index) && (
                          <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSuggest}
                className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition"
              >
                Step 2 — Generate Outfit
              </button>
            </>
          )}

          {/* Suggested Outfit */}
          {currentOutfit && (
            <div className="mt-12 bg-white p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6">
                ✨ Suggested Outfit
              </h2>
              <p className="text-lg font-bold mb-3">
                Score:{" "}
                <span className="text-cyan-600">{currentOutfit.score}%</span>
                <span className="text-gray-500 ml-3 font-normal text-base">
                  {" "}
                  ({currentOutfit.feedback})
                </span>
              </p>

              <div className="flex justify-center flex-wrap gap-6">
                {/* 🔥 CRITICAL FIX: The suggestions from Flask return an array of item objects 
                   like {name, image, category}. Map over the 'items' array. */}
                {currentOutfit.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-2xl shadow-md p-3 hover:shadow-lg transition border border-gray-200"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-40 h-40 object-cover rounded-xl"
                    />
                    <p className="mt-2 text-gray-800 font-medium">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleNextSuggestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
                >
                  Next Suggestion ({currentIndex + 1}/{suggestion.length}) 🔁
                </button>
                <button
                  onClick={handleWear}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
                >
                  Wear This Outfit 👕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OutfitSuggestion;
