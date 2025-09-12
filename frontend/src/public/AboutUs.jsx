import React from "react";
import image1 from "../assets/image/image1.png"; 
   
import Header from "../components/header"; 
import Footer from "../components/footer";

const AboutUs = () => {
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
        <section className="py-16 px-6 md:px-20  text-center">
          <h2 className="text-3xl mb-10 font-bold">About Us</h2>
          <p className="text-gray-600 mb-6 text-base md:text-lg">
           At SmartFit, we believe that fashion should be effortless and enjoyable. Our journey began with a simple idea: to help people make the most of their wardrobes and feel confident in their style choices. We're passionate about empowering you to express your unique personality through fashion, without the stress of decision-making.
          </p>
         
             

      </section>
      </div>
      <Footer/>
    </>
  );
};

export default AboutUs;
