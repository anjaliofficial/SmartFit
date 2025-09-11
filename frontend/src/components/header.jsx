import React from "react";
import logo from "../assets/image/logo.png";

const Header = () => {
     const handleLinkClick = () => setMenuOpen(false);
  return (
    <header className="bg-white h-[60px] shadow-md">
      <div className="justify-between flex " >
        
        {/* Logo */}
        <div className="flex items-left ml-[20px]">
          <img
            src={logo}
            alt="Smart Fit Logo"
            className="h-15 w-15"
          />
        </div>

        {/* Navigation Links */}
   {/* Right side: Nav Links + Login Button */}
<div className="hidden md:flex items-center space-x-20 mr-[10px]">
  {/* Navigation Links */}
  <nav className="flex space-x-15 text-lg font-medium text-gray-800">
    <a href="/LandingPage" onClick={handleLinkClick} className=" hover:text-cyan-600 transition-colors">
      Home
    </a>
    <a href="/AboutUs" onClick={handleLinkClick} className=" hover:text-cyan-600 transition-colors">
      About Us
    </a>
    <a href="/ContactUs" onClick={handleLinkClick} className=" hover:text-cyan-600 transition-colors">
      Contact Us
    </a>
  </nav>

  {/* Login Button */}
  <button className="bg-cyan-500 text-white px-4 py-2 mr-[40px] rounded-lg hover:bg-cyan-600 transition-colors">
    Login/Signup
  </button>
</div>


      </div>
    </header>
  );
};

export default Header;
