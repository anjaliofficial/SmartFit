// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";
import { FaEye, FaTrash } from "react-icons/fa";

const initialOutfits = [
  {
    id: 1,
    shirt: "Red Shirt",
    pants: "Black Jeans",
    shoes: "White Sneakers",
    image: "/images/outfit1.jpg",
    date: "2025-09-10",
  },
  {
    id: 2,
    shirt: "Blue Shirt",
    pants: "Grey Trousers",
    shoes: "Brown Shoes",
    image: "/images/outfit2.jpg",
    date: "2025-09-08",
  },
  {
    id: 3,
    shirt: "Green T-Shirt",
    pants: "Beige Shorts",
    shoes: "Black Sandals",
    image: "/images/outfit3.jpg",
    date: "2025-09-05",
  },
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pastOutfits, setPastOutfits] = useState(initialOutfits);

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // token from login
        const res = await axios.get("http://localhost:3000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleWearAgain = (outfit) => {
    alert(`You're wearing: ${outfit.shirt}, ${outfit.pants}, ${outfit.shoes}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this outfit?")) {
      setPastOutfits(pastOutfits.filter((outfit) => outfit.id !== id));
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-100 p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
          Profile
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">User Information</h2>
          <p>
            <strong>Name:</strong> {user.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {/* Past Outfit History */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Past Outfit History</h2>
          {pastOutfits.length === 0 ? (
            <p className="text-gray-500 text-center">No past outfits saved.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pastOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-gray-50 rounded-lg shadow hover:shadow-xl transition relative overflow-hidden"
                >
                  <img
                    src={outfit.image}
                    alt={`Outfit ${outfit.id}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleWearAgain(outfit)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
                      title="Wear Again"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDelete(outfit.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      title="Delete Outfit"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{outfit.shirt}</p>
                    <p>{outfit.pants}</p>
                    <p>{outfit.shoes}</p>
                    <p className="text-gray-500 text-sm mt-1">{outfit.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
