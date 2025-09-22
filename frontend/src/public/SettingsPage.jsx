import React, { useState, useEffect } from "react";
import {
  FaMoon,
  FaBell,
  FaUserEdit,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeaderAfterLogin from "../components/HeaderAfterLogin";
import Footer from "../components/footer";
import axios from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(res.data.name || res.data.email || "User");
        setDarkMode(res.data.darkMode || false);
        setNotifications(res.data.notifications || true);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Save settings
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        { name: username, darkMode, notifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Settings saved successfully!");
      console.log(res.data.user);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("❌ Failed to save settings. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      } flex flex-col min-h-screen transition-colors duration-300`}
    >
      <HeaderAfterLogin />

      <main className="flex-grow p-10 max-w-5xl mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-6 text-cyan-600 hover:text-cyan-800 font-semibold"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-10">⚙️ Settings</h1>

        <div className="grid gap-10">
          {/* Profile Section */}
          <div
            className={`p-10 rounded-3xl shadow-lg hover:shadow-xl transition w-full ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaUserEdit /> Profile
            </h2>
            <label className="block">
              <span className="text-lg">Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-4 border rounded-2xl mt-3 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : ""
                }`}
              />
            </label>
          </div>

          {/* Preferences */}
          <div
            className={`p-10 rounded-3xl shadow-lg hover:shadow-xl transition w-full ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Preferences</h2>

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-4 border-b last:border-0">
              <span className="flex items-center gap-3 text-lg">
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

            {/* Notifications */}
            <div className="flex items-center justify-between py-4">
              <span className="flex items-center gap-3 text-lg">
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
            disabled={loading}
            className="flex items-center gap-3 bg-cyan-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-cyan-700 transition text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
