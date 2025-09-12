import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  FaTshirt,
  FaBoxOpen,
  FaStar,
  FaCloudSun,
  FaBell,
} from "react-icons/fa";
import { MdCheckroom } from "react-icons/md";

const Dashboard = () => {
  return (
    <>
      {/* Header */}
      <Header />

      <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
        {/* Welcome Section */}
        <section className="bg-cyan-100 p-6 rounded-xl mx-4 md:mx-16 mt-6">
          <h1 className="text-2xl font-bold mb-2">👋 Welcome back, Anjali!</h1>
          <p className="text-gray-700">
            Here’s a quick look at your fashion world today.
          </p>
        </section>

        {/* Stats Section */}
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

        {/* Action Buttons */}
        <section className="flex flex-wrap justify-center gap-4 mt-8 mx-4 md:mx-16">
          <button className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition">
            + Add Outfit
          </button>
          <button className="bg-white border border-cyan-500 text-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-50 transition">
            ✅ Check My Fit
          </button>
          <button className="bg-white border border-cyan-500 text-cyan-500 px-6 py-3 rounded-lg hover:bg-cyan-50 transition">
            📸 Snap & Upload
          </button>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-4 md:mx-16 my-10">
          {/* Smart Suggestions */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              Today’s Smart Suggestions for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Suggestion 1 */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src="https://via.placeholder.com/300x200"
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
                  src="https://via.placeholder.com/300x200"
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

          {/* Recent Activity & Insights */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>🧥 You added a new jacket yesterday.</li>
              <li>🎉 You created a new fit: Party Night.</li>
              <li>🌸 You favorited Summer Dress.</li>
            </ul>

            <div className="mt-6 p-4 bg-white rounded-xl shadow">
              <h3 className="font-bold mb-2">Weekly Closet Insights</h3>
              <p className="text-sm text-gray-700">
                👟 50% of your outfits this week included sneakers.
              </p>
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl shadow">
              <h3 className="font-bold mb-2">Notifications & Reminders</h3>
              <p className="text-sm">
                ☔ Weather Alert: Try a raincoat for today!
              </p>
              <p className="text-sm">
                🏢 Office Look Reminder: Don’t forget to plan tomorrow’s look.
              </p>
            </div>
          </div>
        </section>

        {/* Favorites Highlight */}
        <section className="mx-4 md:mx-16 mb-12">
          <h2 className="text-xl font-bold mb-4">Favorites Highlight</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((fav) => (
              <div
                key={fav}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <img
                  src="https://via.placeholder.com/300x300"
                  alt="Favorite Outfit"
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <button className="w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded hover:bg-cyan-50 transition">
                    Wear Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Dashboard;
