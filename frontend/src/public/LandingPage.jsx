import React from "react";
import image1 from "../assets/image/image1.png"; 
import image2 from "../assets/image/image2.png";
import image3 from "../assets/image/image3.png";
import image4 from "../assets/image/image4.png";   
import Header from "../components/header"; 
import Footer from "../components/footer";

const LandingPage = () => {
  return (
    <>
      {/* Header */}
      <Header />

      <div className="font-sans text-gray-800">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] flex justify-center items-center overflow-hidden">
          <img
            src={image1}
            alt="Style Illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute left-6 bottom-10 md:left-16 md:bottom-16 max-w-lg text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Your Personal Style Assistant
            </h1>
            <p className="text-gray-600 mb-6 text-base md:text-lg">
              Upload your wardrobe, check outfit compatibility, and get personalized
              style suggestions. Elevate your fashion game with SmartFit.
            </p>
            <button className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
              Get Started
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 md:px-20 text-center">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            Discover how SmartFit can transform your wardrobe management and style choices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Feature 1 */}
            <div
              className="p-6 rounded-lg shadow hover:shadow-lg transition"
              style={{ backgroundColor: "#16BCBC" }}
            >
              <img
                src={image2}
                alt="Outfit Upload"
                className="w-[120px] h-[120px] mx-auto mb-4"
              />
              <h1 className="text-white text-2xl font-bold mb-2">
                Outfit Upload
              </h1>
              <p className="text-gray-100">
                Easily upload your existing items to create a digital closet.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="p-6 rounded-lg shadow hover:shadow-lg transition"
              style={{ backgroundColor: "#16BCBC" }}
            >
              <img
                src={image3}
                alt="Compatibility Check"
                className="w-[120px] h-[120px] mx-auto mb-4"
              />
              <h1 className="text-white text-2xl font-bold mb-2">
                Compatibility Check
              </h1>
              <p className="text-gray-100">
                Ensure your outfits are perfectly coordinated with our smart suggestions.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="p-6 rounded-lg shadow hover:shadow-lg transition"
              style={{ backgroundColor: "#16BCBC" }}
            >
              <img
                src={image4}
                alt="Style Suggestions"
                className="w-[120px] h-[120px] mx-auto mb-4"
              />
              <h1 className="text-white text-2xl font-bold mb-2">
                Style Suggestions
              </h1>
              <p className="text-gray-100">
                Recommendations based on your style preferences.
              </p>
            </div>

          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
};

export default LandingPage;
