// src/pages/Login.jsx
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Digital from "../assets/image/digital.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token, user } = response.data;

      // Save token & user info
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name || "");

      alert(`Welcome back, ${user.name || "User"}! Redirecting...`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Better error handling
      if (err.response) {
        // Backend responded with error
        alert(err.response.data.message || "Login failed. Check credentials.");
      } else if (err.request) {
        // No response from server
        alert("Server not responding. Make sure backend is running.");
      } else {
        // Other errors
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src={Digital}
          alt="Digital Closet"
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 mb-6">
            Login to manage your digital closet
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-cyan-600 hover:underline"
              >
                Forgot your Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              }`}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">Or continue with</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <FcGoogle className="text-2xl mr-2" />
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Do not have an account?{" "}
            <Link to="/signup" className="text-cyan-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
