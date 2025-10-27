import React, { useEffect, useState } from "react";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";

const WearingNow = () => {
  // outfit state now holds the array of item objects (item.items)
  const [outfitItems, setOutfitItems] = useState([]);
  // We can optionally store the full outfit object (including score/feedback)
  const [fullOutfit, setFullOutfit] = useState(null);

  useEffect(() => {
    const savedString = localStorage.getItem("wearingNow");
    if (savedString) {
      try {
        const savedOutfit = JSON.parse(savedString);

        // 🚨 CRITICAL FIX: The data saved by handleWear in OutfitSuggestion
        // is an object {items: [...], score: ..., feedback: ...}. We must extract
        // the 'items' array.
        if (savedOutfit && Array.isArray(savedOutfit.items)) {
          setOutfitItems(savedOutfit.items);
          setFullOutfit(savedOutfit);
        } else if (Array.isArray(savedOutfit)) {
          // Fallback for older/simpler saved structure (if it was just the array)
          setOutfitItems(savedOutfit);
          setFullOutfit({
            items: savedOutfit,
            score: null,
            feedback: "Directly saved items.",
          });
        } else {
          // Case where it's an empty object or invalid structure
          setOutfitItems([]);
          setFullOutfit(null);
        }
      } catch (e) {
        console.error("Failed to parse 'wearingNow' from localStorage:", e);
        localStorage.removeItem("wearingNow");
      }
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem("wearingNow");
    setOutfitItems([]);
    setFullOutfit(null);
  };

  const hasOutfit = outfitItems.length > 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-semibold mb-10 text-gray-800">
            👕 Wearing Now
          </h1>

          {!hasOutfit ? (
            <div className="bg-white p-10 rounded-2xl shadow-md max-w-md mx-auto">
              <p className="text-gray-600 text-lg mb-4">
                You haven’t chosen an outfit yet.
              </p>
              <a
                href="/outfit-suggestion"
                className="text-cyan-600 hover:text-cyan-800 font-medium transition"
              >
                Go to Outfit Suggestions →
              </a>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              {/* Display Score and Feedback if available */}
              {fullOutfit && fullOutfit.score && (
                <div className="mb-6 border-b pb-4">
                  <p className="text-xl font-bold text-gray-700">
                    Suggested Score:{" "}
                    <span className="text-cyan-600">{fullOutfit.score}%</span>
                  </p>
                  <p className="text-md text-gray-500 mt-1">
                    Feedback: {fullOutfit.feedback}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-8">
                {/* Map over outfitItems state */}
                {outfitItems.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 shadow-md p-4 rounded-2xl w-44 hover:shadow-lg transition border border-gray-200"
                  >
                    <img
                      src={item.image}
                      // item.image contains the Base64 string for display
                      alt={item.name}
                      className="w-40 h-40 object-cover rounded-xl"
                    />
                    <h3 className="mt-3 text-gray-700 font-medium truncate">
                      {item.name || "Unnamed Item"}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasOutfit && (
            <div className="mt-10">
              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
              >
                Clear Outfit
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WearingNow;
