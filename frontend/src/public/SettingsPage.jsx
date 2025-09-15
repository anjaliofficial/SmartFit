import React, { useState } from "react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [username, setUsername] = useState("User123");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Profile</h2>
        <label className="block mb-2">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
        </label>
      </div>

      {/* Preferences */}
      <div className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Preferences</h2>

        <div className="flex items-center justify-between mb-3">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            className="w-5 h-5"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Settings;
