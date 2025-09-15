import React from "react";
import FPW from "../assets/image/fpw.png";

const ForgetPassword = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src={FPW}
          alt="Digital Closet"
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800">Forgot Your Password?</h2>
          <p className="text-gray-500 mb-6">
            No worries! Enter your email below and we will send you a link to reset it.
          </p>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your email"
                required
              />
            </div>


            <button
              type="submit"
              className="w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Reset Your Password
            </button>
          </form>

      


          {/* Sign Up */}
          <p className="text-center text-gray-600 mt-6 text-sm">
            Remember Your Password? {" "}
            <a href="/Signup" className="text-cyan-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
