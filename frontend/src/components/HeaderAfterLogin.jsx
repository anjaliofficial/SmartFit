import React from "react";
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

  const handleLogout = () => {
    localStorage.removeItem("user");
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

        {/* Menu (always visible) */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600"
          >
            <FaTachometerAlt /> Dashboard
          </button>
          <button
            onClick={() => navigate("/saved-outfits")}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600"
          >
            <FaStar /> Saved Outfits
          </button>
          <button
            onClick={() => navigate("/profilepage")}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600"
          >
            <FaUserCircle /> Profile
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600"
          >
            <FaCogs /> Settings
          </button>
          <button
            onClick={() => alert("Notifications coming soon!")}
            className="flex items-center gap-2 text-gray-700 hover:text-cyan-600"
          >
            <FaBell /> Notifications
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
