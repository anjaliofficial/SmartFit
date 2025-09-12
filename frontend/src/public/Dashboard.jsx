import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

// Import images
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

  const favorites = [
    { id: 1, img: fav1, name: "Classic Casual" },
    { id: 2, img: fav2, name: "Party Night" },
    { id: 3, img: fav3, name: "Summer Dress" },
    { id: 4, img: fav4, name: "Winter Layers" },
  ];

  return (
    <>
      <Header />

      <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
        {/* Welcome Section */}
        <section className="bg-cyan-100 p-6 rounded-xl mx-4 md:mx-16 mt-6">
          <h1 className="text-2xl font-bold mb-2">👋 Welcome back, Anjali!</h1>
          <p className="text-gray-700">
            Here’s a quick look at your fashion world today.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-4 md:mx-16 mt-6">
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
            <FaTshirt className="text-cyan-500 text-3xl mb-2" />
            <h2 className="text-2xl font-bold">120</h2>
            <p className="text-gray-600">Outfits Added</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
            <FaBoxOpen className="text-cyan-500 text-3xl mb-2" />
            <h2 className="text-2xl font-bold">350</h2>
            <p className="text-gray-600">Closet Items</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
            <MdCheckroom className="text-cyan-500 text-3xl mb-2" />
            <p className="text-sm text-gray-600">Last Fit Checked</p>
            <button className="mt-2 text-sm bg-cyan-500 text-white px-3 py-1 rounded hover:bg-cyan-600">
              Re-try this Fit
            </button>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
            <FaStar className="text-cyan-500 text-3xl mb-2" />
            <h2 className="text-2xl font-bold">45</h2>
            <p className="text-gray-600">Favorites Saved</p>
          </div>
        </section>

        {/* Suggestions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 md:mx-16 my-10">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              Today’s Smart Suggestions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Suggestion 1 */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src={casualImage}
                  alt="Casual Friday Look"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">Casual Friday Look</h3>
                  <p className="text-gray-600 text-sm">
                    Blazer + Jeans + Sneakers
                  </p>
                  <button className="mt-3 w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded hover:bg-cyan-50 transition">
                    Try this Fit
                  </button>
                </div>
              </div>

              {/* Suggestion 2 */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src={summerImage}
                  alt="Summer Day Outfit"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">Summer Day Outfit</h3>
                  <p className="text-gray-600 text-sm">
                    Floral Dress + Sandals
                  </p>
                  <button className="mt-3 w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded hover:bg-cyan-50 transition">
                    Try this Fit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>🧥 You added a new jacket yesterday.</li>
              <li>🎉 You created a new fit: Party Night.</li>
              <li>🌸 You favorited Summer Dress.</li>
            </ul>
          </div>
        </section>

        {/* Favorites Highlight */}
        <section className="mx-4 md:mx-16 mb-12">
          <h2 className="text-xl font-bold mb-4">Favorites Highlight</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/outfit/${fav.id}`)}
              >
                <img
                  src={fav.img}
                  alt={fav.name}
                  className="w-full h-72 object-contain bg-gray-100"
                />
                <div className="p-4 text-center">
                  <h3 className="font-bold">{fav.name}</h3>
                  <button className="mt-2 w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded hover:bg-cyan-50 transition">
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
