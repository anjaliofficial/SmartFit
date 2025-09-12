// App.jsx
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-teal-500">SF</div>
        <nav className="flex space-x-6">
          <a href="#" className="text-gray-700 hover:text-teal-500">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-teal-500">
            My Closet
          </a>
          <a href="#" className="text-gray-700 hover:text-teal-500">
            Check My Fit
          </a>
        </nav>
        <button className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded">
          <AiOutlinePlus /> Add Outfit
        </button>
      </header>

      {/* Welcome Banner */}
      <section className="px-8 py-6 bg-teal-50 rounded-b-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👋 Welcome back, Anjali!</h1>
          <p className="text-gray-600">
            Here's a quick look at your fashion world today.
          </p>
        </div>
        <img
          src="https://randomuser.me/api/portraits/women/68.jpg"
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />
      </section>

      {/* Dashboard Cards */}
      <section className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Outfits Added</p>
          <p className="text-2xl font-bold">120</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Closet Items</p>
          <p className="text-2xl font-bold">350</p>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Last Fit Checked</p>
          <button className="text-teal-500 underline mt-1">
            Re-try this Fit
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <p className="text-gray-500">Favorites Saved</p>
          <p className="text-2xl font-bold">45</p>
        </div>
      </section>

      {/* Actions */}
      <section className="px-8 py-4 flex gap-4">
        <button className="bg-teal-500 text-white px-4 py-2 rounded">
          Add Outfit
        </button>
        <button className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded">
          ✨ Check My Fit
        </button>
        <button className="bg-white text-gray-800 px-4 py-2 rounded border">
          Snap & Upload
        </button>
      </section>

      {/* Smart Suggestions */}
      <section className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <img
            src="https://via.placeholder.com/200x250"
            alt="Casual Friday Look"
            className="mb-4"
          />
          <h2 className="font-bold">Casual Friday Look</h2>
          <p className="text-gray-500">Blazer + Jeans + Sneakers</p>
          <button className="mt-2 text-teal-500 underline">Try this Fit</button>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <img
            src="https://via.placeholder.com/200x250"
            alt="Summer Day Outfit"
            className="mb-4"
          />
          <h2 className="font-bold">Summer Day Outfit</h2>
          <p className="text-gray-500">Floral Dress + Sandals</p>
          <button className="mt-2 text-teal-500 underline">Try this Fit</button>
        </div>
      </section>

      {/* Favorites Highlight */}
      <section className="px-8 py-6">
        <h3 className="font-bold mb-4">Favorites Highlight</h3>
        <div className="flex gap-4 overflow-x-auto">
          <div className="min-w-[150px] bg-white rounded shadow p-2 text-center">
            <img
              src="https://via.placeholder.com/150x200"
              alt="Favorite 1"
              className="mb-2"
            />
            <button className="text-teal-500 underline text-sm">
              Wear Again
            </button>
          </div>
          <div className="min-w-[150px] bg-white rounded shadow p-2 text-center">
            <img
              src="https://via.placeholder.com/150x200"
              alt="Favorite 2"
              className="mb-2"
            />
            <button className="text-teal-500 underline text-sm">
              Wear Again
            </button>
          </div>
          <div className="min-w-[150px] bg-white rounded shadow p-2 text-center">
            <img
              src="https://via.placeholder.com/150x200"
              alt="Favorite 3"
              className="mb-2"
            />
            <button className="text-teal-500 underline text-sm">
              Wear Again
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar - Recent Activity */}
      <section className="px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded shadow p-4">
          <h4 className="font-bold mb-2">Recent Activity</h4>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>You added a new jacket 🧥 yesterday.</li>
            <li>You created a new fit: Party Night. 🎉 3 days ago</li>
            <li>You favorited Summer Dress 🌸 5 days ago</li>
          </ul>
          <h4 className="font-bold mt-4 mb-2">Weekly Closet Insights</h4>
          <p className="text-gray-600 text-sm">
            50% of your outfits this week included sneakers.
          </p>
          <h4 className="font-bold mt-4 mb-2">Notifications & Reminders</h4>
          <p className="text-gray-600 text-sm">
            🌦 Weather Alert: Try a raincoat today!
          </p>
          <p className="text-gray-600 text-sm">
            🏢 Office Look Reminder: Don't forget to plan tomorrow's look.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="font-bold text-lg">SmartFit</p>
        <p className="text-sm mb-2">Your Personal Style Assistant</p>
        <div className="flex justify-center gap-4 text-xs mb-2">
          <a href="#" className="hover:underline">
            Features
          </a>
          <a href="#" className="hover:underline">
            About Us
          </a>
          <a href="#" className="hover:underline">
            Contact Us
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
        <p className="text-gray-400 text-xs">
          © 2024 SmartFit. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Login;
