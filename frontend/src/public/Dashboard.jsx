import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

import fav1 from "../assets/image/fav1.jpg";
import fav2 from "../assets/image/fav2.jpg";
import fav3 from "../assets/image/fav3.jpg";
import fav4 from "../assets/image/fav4.jpg";

import { FaTshirt, FaBoxOpen, FaStar } from "react-icons/fa";
import { MdCheckroom } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();

  const favorites = [
    { id: 1, img: fav1, name: "Classic Casual" },
    { id: 2, img: fav2, name: "Party Night" },
    { id: 3, img: fav3, name: "Summer Dress" },
    { id: 4, img: fav4, name: "Winter Layers" },
  ];

  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // ---------------- Simulated AI detection ----------------
  const detectType = (fileName) => {
    const name = fileName.toLowerCase();
    if (
      name.includes("shirt") ||
      name.includes("tshirt") ||
      name.includes("top")
    )
      return "Shirt";
    if (
      name.includes("pant") ||
      name.includes("jeans") ||
      name.includes("trouser")
    )
      return "Pants";
    if (
      name.includes("shoe") ||
      name.includes("sneaker") ||
      name.includes("boot")
    )
      return "Shoes";
    if (name.includes("jacket") || name.includes("coat")) return "Jacket";
    return "Accessory";
  };

  const detectColor = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes("blue")) return "Blue";
    if (name.includes("red")) return "Red";
    if (name.includes("white")) return "White";
    if (name.includes("black")) return "Black";
    if (name.includes("beige")) return "Beige";
    return "Neutral";
  };

  // Color compatibility rules
  const compatible = {
    Blue: ["Black", "White", "Beige", "Neutral"],
    Red: ["Black", "White", "Neutral"],
    White: ["Black", "Blue", "Red", "Beige", "Neutral"],
    Black: ["Blue", "Red", "White", "Beige", "Neutral"],
    Beige: ["Blue", "White", "Black", "Neutral"],
    Neutral: ["Blue", "Red", "White", "Black", "Beige", "Neutral"],
  };

  // ---------------- Handle File Upload ----------------
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: detectType(file.name),
      color: detectColor(file.name),
    }));
    setItems((prev) => [...prev, ...newItems]);
    setShowPreview(false);
    setSuggestions([]);
  };

  // ---------------- Generate Smart Outfit Suggestions ----------------
  const handleAnalyze = () => {
    if (items.length === 0) {
      alert("Please upload some items first!");
      return;
    }

    const shirts = items.filter((i) => i.type === "Shirt");
    const pants = items.filter((i) => i.type === "Pants");
    const shoes = items.filter((i) => i.type === "Shoes");
    const jackets = items.filter((i) => i.type === "Jacket");
    const accessories = items.filter((i) => i.type === "Accessory");

    const combos = [];

    shirts.forEach((shirt) => {
      pants.forEach((pant) => {
        shoes.forEach((shoe) => {
          // Check color compatibility
          if (
            compatible[shirt.color]?.includes(pant.color) &&
            compatible[shirt.color]?.includes(shoe.color)
          ) {
            const jacket = jackets[0] || null;
            const accessory = accessories[0] || null;
            combos.push({ shirt, pant, shoe, jacket, accessory });
          }
        });
      });
    });

    setSuggestions(combos);
    setShowPreview(true);
  };

  return (
    <>
      <Header />

      <div className="font-sans text-gray-800 bg-gray-50 min-h-screen p-4 md:p-8">
        {/* Welcome */}
        <section className="bg-cyan-100 p-6 rounded-xl shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-2">👋 Welcome back, Anjali!</h1>
          <p className="text-gray-700 text-lg">
            Upload your clothing items and see smart outfit suggestions.
          </p>
        </section>

        {/* Upload Section */}
        <section className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">Upload Clothing Items</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-cyan-500 transition">
            <p className="text-gray-500 mb-2">
              Drag & drop images here or click to upload
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="cursor-pointer"
            />
          </div>

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
                    <p className="text-sm font-semibold">
                      {item.type} ({item.color})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-cyan-600 transition"
              onClick={handleAnalyze}
            >
              Analyze Outfit
            </button>
          </div>
        </section>

        {/* Smart Outfit Suggestions */}
        {showPreview && suggestions.length > 0 && (
          <section className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Smart Outfit Suggestions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {suggestions.map((combo, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-xl shadow p-4 flex flex-col items-center"
                >
                  <div className="flex gap-2 mb-2">
                    {[
                      combo.shirt,
                      combo.pant,
                      combo.shoe,
                      combo.jacket,
                      combo.accessory,
                    ].map(
                      (item, i) =>
                        item && (
                          <img
                            key={i}
                            src={item.preview}
                            alt={item.type}
                            className="w-24 h-24 object-contain rounded"
                          />
                        )
                    )}
                  </div>
                  <p className="text-gray-600 text-sm text-center">
                    {combo.shirt.type} ({combo.shirt.color}) + {combo.pant.type}{" "}
                    ({combo.pant.color}) + {combo.shoe.type} ({combo.shoe.color}
                    )
                    {combo.jacket
                      ? ` + ${combo.jacket.type} (${combo.jacket.color})`
                      : ""}
                    {combo.accessory
                      ? ` + ${combo.accessory.type} (${combo.accessory.color})`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-600">
              These are smart outfit combinations based on type and color
              compatibility.
            </p>
          </section>
        )}

        {/* Stats */}
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

        {/* Favorites */}
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
