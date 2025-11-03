import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Slider from "react-slick";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const colorHarmony = {
  Fair: ["white", "blue", "pink", "beige", "lightgray"],
  Olive: ["green", "brown", "mustard", "cream", "navy"],
  Deep: ["red", "purple", "black", "gold", "royalblue"],
};

const placeholderImg = "https://via.placeholder.com/150";
const API_URL = "http://localhost:5000/api/outfits";

const OutfitSuggestion = () => {
  const [closetItems, setClosetItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [facePhoto, setFacePhoto] = useState(null);
  const [skinTone, setSkinTone] = useState("Fair");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Alert helper
  const showAlert = useCallback((msg) => alert(msg), []);

  // Fetch Closet Items
  const fetchClosetItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in!");

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const itemsWithUrl = (res.data.outfits || []).map((item) => ({
          ...item,
          images:
            item.imageUrl && item.imageUrl.length
              ? Array.isArray(item.imageUrl)
                ? item.imageUrl.map((url) => `http://localhost:5000/${url}`)
                : [`http://localhost:5000/${item.imageUrl}`]
              : [placeholderImg],
        }));
        setClosetItems(itemsWithUrl);
      }
    } catch (err) {
      console.error("Failed to fetch closet items:", err);
      showAlert(
        `Error fetching closet items: ${
          err.response?.data?.message || err.message
        }`
      );
      setClosetItems([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchClosetItems();
  }, [fetchClosetItems]);

  // Camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject)
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error(err);
      showAlert("Cannot access camera. Check permissions.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return showAlert("Camera not started");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (!blob) return showAlert("Failed to capture photo");
        setFacePhoto(
          new File([blob], `face_${Date.now()}.jpg`, { type: "image/jpeg" })
        );
      },
      "image/jpeg",
      0.9
    );
  };

  const detectSkinTone = async () => {
    if (!facePhoto) return showAlert("Capture a photo first!");
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      const tones = ["Fair", "Olive", "Deep"];
      const mockTone = tones[Math.floor(Math.random() * tones.length)];
      setSkinTone(mockTone);
      showAlert(`✅ Skin tone detected: ${mockTone}`);
    } catch (err) {
      console.error(err);
      showAlert("Failed to detect skin tone.");
    } finally {
      setLoading(false);
    }
  };

  // Select items
  const handleSelect = (i) =>
    setSelectedItems((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  // Generate outfits
  const generateOutfits = () => {
    if (selectedItems.length < 2) return showAlert("Select at least 2 items!");
    if (!skinTone) return showAlert("Detect skin tone first!");
    setLoading(true);

    const items = selectedItems.map((i) => closetItems[i]);
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    const categories = Object.keys(grouped);

    const combine = (index = 0, current = []) => {
      if (index === categories.length) return [current];
      const cat = categories[index];
      const combos = [];
      for (const item of grouped[cat]) {
        combos.push(...combine(index + 1, [...current, item]));
      }
      return combos;
    };

    let combos = combine();

    combos = combos.map((combo) => {
      let score = 50;
      const feedback = [];
      combo.forEach((item) => {
        const primaryColor = item.color?.toLowerCase() || "";
        if (colorHarmony[skinTone].includes(primaryColor)) {
          score += 10;
          feedback.push(`${item.name} matches your skin tone!`);
        } else {
          score -= 5;
          feedback.push(`${item.name} could be a better color.`);
        }
      });
      score = Math.min(Math.max(score, 0), 100);
      return { items: combo, score, feedback: feedback.join(" ") };
    });

    combos.sort((a, b) => b.score - a.score);
    setSuggestions(combos);
    setLoading(false);
    if (combos.length > 0)
      showAlert(`🎉 ${combos.length} outfit(s) generated!`);
  };

  const handleWear = (outfit) => {
    localStorage.setItem("wearingNow", JSON.stringify(outfit));
    showAlert("✅ Outfit saved to 'Wearing Now'!");
  };

  // Grouped items
  const groupedItems = closetItems.reduce((acc, item, idx) => {
    (acc[item.category] = acc[item.category] || []).push({ ...item, idx });
    return acc;
  }, {});

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-10">
            🪞 AI Outfit Suggestion
          </h1>

          {/* Camera & Skin Tone */}
          <section className="mb-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Step 0 — Detect Skin Tone
            </h2>
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                className="w-full max-w-xs h-60 border-4 border-gray-300 rounded-xl mb-4 object-cover bg-black"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="flex gap-3 mb-4 flex-wrap justify-center">
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Start Camera
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Capture Photo
                </button>
                <button
                  onClick={detectSkinTone}
                  disabled={loading || !facePhoto}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? "Detecting..." : "Detect Skin Tone"}
                </button>
              </div>
              {skinTone && (
                <p className="font-semibold mt-2">
                  Detected skin tone: {skinTone}
                </p>
              )}
              {facePhoto && (
                <img
                  src={URL.createObjectURL(facePhoto)}
                  alt="face"
                  className="w-40 h-40 object-cover rounded-full mx-auto mt-4"
                />
              )}
            </div>
          </section>

          {/* Closet Items */}
          {closetItems.length === 0 ? (
            <p>No clothes yet. Go to My Closet to add items!</p>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Step 1 — Select Items ({selectedItems.length} selected)
              </h2>
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map(({ idx, ...item }) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-transform transform ${
                          selectedItems.includes(idx)
                            ? "border-cyan-500 scale-[1.02]"
                            : "border-gray-200 hover:shadow-lg"
                        }`}
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-40 object-cover"
                        />
                        <p className="p-2 text-sm font-medium truncate">
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={generateOutfits}
                disabled={loading || selectedItems.length < 2 || !skinTone}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg mt-4 font-semibold text-lg"
              >
                {loading
                  ? "Generating Outfits..."
                  : "Step 2 — Generate Outfits"}
              </button>
            </>
          )}

          {/* Suggested Outfits Carousel */}
          {suggestions.length > 0 && (
            <div className="mt-10 bg-white p-6 rounded-2xl shadow-2xl border-4 border-cyan-100">
              <h2 className="text-2xl font-bold mb-4">✨ Suggested Outfits</h2>
              <Slider {...sliderSettings}>
                {suggestions.map((outfit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <p className="text-lg mb-2 font-semibold">
                      Score:{" "}
                      <span className="text-cyan-600">{outfit.score}%</span>
                    </p>
                    <p className="text-gray-600 mb-4">{outfit.feedback}</p>
                    <div className="flex flex-wrap gap-4 justify-center mb-4">
                      {outfit.items.map((item, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-lg shadow-md p-2 w-40"
                        >
                          <Slider
                            {...{
                              dots: true,
                              infinite: true,
                              speed: 300,
                              slidesToShow: 1,
                              slidesToScroll: 1,
                              arrows: true,
                            }}
                          >
                            {item.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={item.name}
                                className="w-full h-40 object-cover rounded-lg"
                              />
                            ))}
                          </Slider>
                          <p className="mt-2 font-semibold text-gray-700 truncate">
                            {item.name}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleWear(outfit)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Wear
                    </button>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OutfitSuggestion;
