import React, { useState } from "react";
import { FaMoon, FaBell, FaUserEdit, FaSave } from "react-icons/fa";
import HeaderAfterLogin from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [username, setUsername] = useState("User123");

  const handleSave = () => {
    alert("✅ Settings saved successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderAfterLogin />

      <main className="flex-grow p-10 max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">⚙️ Settings</h1>

        <div className="grid gap-10">
          {/* Profile Section */}
          <div className="p-10 bg-white rounded-3xl shadow-lg hover:shadow-xl transition w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-700">
              <FaUserEdit /> Profile
            </h2>
            <label className="block">
              <span className="text-lg text-gray-600">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border rounded-2xl mt-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </label>
          </div>

          {/* Preferences */}
          <div className="p-10 bg-white rounded-3xl shadow-lg hover:shadow-xl transition w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">
              Preferences
            </h2>

            <div className="flex items-center justify-between py-4 border-b last:border-0">
              <span className="flex items-center gap-3 text-gray-700 text-lg">
                <FaMoon /> Dark Mode
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full p-1 transition-colors ${
                    darkMode ? "bg-cyan-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      darkMode ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="flex items-center gap-3 text-gray-700 text-lg">
                <FaBell /> Enable Notifications
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full p-1 transition-colors ${
                    notifications ? "bg-cyan-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      notifications ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSave}
            className="flex items-center gap-3 bg-cyan-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-cyan-700 transition text-lg font-semibold"
          >
            <FaSave /> Save Changes
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
