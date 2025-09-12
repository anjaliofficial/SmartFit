import React from "react";

const Footer = () => {
  return (
    <div className="font-sans">
     

      {/* Footer */}
      <footer className="bg-[#0E1629] text-gray-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Brand */}
          <h2 className="text-white text-xl font-bold">Smart Fit</h2>
         <p className="mt-2 mb-6 text-[#808080]">
  Your Personal Style Assistant
</p>


          {/* Links */}
        <div>
  <div className="flex justify-center space-x-10 mb-6">
    <a href="#" className="hover:text-white text-[#61758A]">
      Features
    </a>
    <a href="#" className="hover:text-white text-[#61758A]">
      About Us
    </a>
    <a href="#" className="hover:text-white text-[#61758A]">
      Contact Us
    </a>
    <a href="#" className="hover:text-white text-[#61758A]">
      Privacy Policy
    </a>
  </div>

  {/* Copyright */}
  <p className="text-sm text-[#61758A]">
    ©2024 Smart Fit. All rights reserved.
  </p>
    </div>
</div>
      </footer>
    </div>
  );
};

export default Footer;
