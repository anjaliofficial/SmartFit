import React, { useState } from "react";
import FPW from "../assets/image/fpw.png";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src={FPW}
          alt="Forgot Password"
          className="h-full w-auto object-contain"
        />
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800">
            Forgot Your Password?
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {message && <p className="text-green-600 mb-4">{message}</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              }`}
            >
              {loading ? "Sending..." : "Reset Your Password"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Remember your password?{" "}
            <a href="/Login" className="text-cyan-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
