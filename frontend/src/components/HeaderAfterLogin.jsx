import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaCogs,
  FaSignOutAlt,
  FaBell,
  FaStar,
  FaTachometerAlt,
} from "react-icons/fa";
import logo from "../assets/image/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      setUsername(JSON.parse(user).name || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/landingpage");
  };

  return (
    <header className="bg-white h-[60px] shadow-md">
      <div className="flex justify-between items-center px-4 md:px-8">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Smart Fit Logo" className="h-12 w-12" />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="/landingpage"
            className="hover:text-cyan-600 transition-colors"
          >
            Home
          </a>
          <a href="/aboutus" className="hover:text-cyan-600 transition-colors">
            About Us
          </a>
          <a
            href="/contactus"
            className="hover:text-cyan-600 transition-colors"
          >
            Contact Us
          </a>

          {/* Right Side */}
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/profilepage")}
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Login / Signup
            </button>
          ) : (
            <div className="relative group">
              {/* User Dropdown */}
              <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                <FaUserCircle className="text-xl text-gray-700" />
                <span className="font-semibold text-gray-700">{username}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg hidden group-hover:block">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaTachometerAlt /> Dashboard
                </button>
                <button
                  onClick={() => navigate("/saved-outfits")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaStar /> Saved Outfits
                </button>
                <button
                  onClick={() => navigate("/profilepage")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaUserCircle /> Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaCogs /> Settings
                </button>
                <button
                  onClick={() => alert("Notifications coming soon!")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaBell /> Notifications
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
