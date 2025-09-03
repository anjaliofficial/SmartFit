import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">
          SmartFitBot Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Box */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Box */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
