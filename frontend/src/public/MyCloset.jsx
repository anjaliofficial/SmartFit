// MyCloset.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/footer";

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const OUTFIT_API_URL = `${API_URL}/api/outfits`;
const placeholderImg = "/placeholder.png";

// ------------------- Image Renderer -------------------
const ImageRenderer = ({ imageUrl, altText, className }) => {
  let finalUrl = placeholderImg;

  if (imageUrl) {
    if (imageUrl.startsWith("http")) finalUrl = imageUrl;
    else finalUrl = `${API_URL}/${imageUrl.replace(/^uploads\//, "")}`;
  }

  return (
    <img
      src={finalUrl}
      alt={altText}
      className={className}
      onError={(e) => (e.target.src = placeholderImg)}
    />
  );
};

// ------------------- Main Component -------------------
const MyCloset = () => {
  const navigate = useNavigate();

  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [appMessage, setAppMessage] = useState({ text: null, type: null });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    season: "",
    occasion: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const categories = [
    "Top",
    "Bottom",
    "Dress",
    "Outerwear",
    "Footwear",
    "Accessory",
    "Others",
  ];
  const seasons = ["Spring", "Summer", "Fall", "Winter", "All"];
  const occasions = ["Casual", "Formal", "Party", "Outdoor", "Work", "Other"];

  // ---------------- Helper: Display Messages ----------------
  const displayMessage = useCallback((text, type = "success") => {
    setAppMessage({ text, type });
    setTimeout(() => setAppMessage({ text: null, type: null }), 5000);
  }, []);

  // ---------------- Fetch Closet Items ----------------
  const fetchClosetItems = useCallback(async () => {
    if (uploadProgress === 0) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        displayMessage("You are not logged in. Redirecting...", "error");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const res = await axios.get(OUTFIT_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClosetItems(res.data.outfits || []);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      displayMessage(`Failed to load closet items. ${msg}`, "error");
      if (error.response?.status === 401)
        setTimeout(() => navigate("/login"), 1500);
    } finally {
      setLoading(false);
    }
  }, [displayMessage, navigate, uploadProgress]);

  useEffect(() => {
    fetchClosetItems();
  }, [fetchClosetItems]);

  // ---------------- Handle Input Change ----------------
  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files?.length) {
      const selected = Array.from(files).slice(0, 5);
      setSelectedFiles(selected);

      const previews = await Promise.all(
        selected.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            })
        )
      );
      setImagePreviews(previews);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ---------------- Cancel Edit ----------------
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      color: "",
      season: "",
      occasion: "",
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadProgress(0);
    displayMessage("Edit cancelled.", "info");
  };

  // ---------------- Submit (Add/Edit) ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUpdating(true);
    setUploadProgress(0);

    const isAdding = editingId === null;

    if (!formData.name || !formData.category) {
      displayMessage("Name and category are required!", "error");
      setLoading(false);
      setIsUpdating(false);
      return;
    }

    if (isAdding && selectedFiles.length === 0) {
      displayMessage("Please upload at least one image!", "error");
      setLoading(false);
      setIsUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");

      if (isAdding) {
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        selectedFiles.forEach((file) => data.append("item_images", file));

        const res = await axios.post(OUTFIT_API_URL, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (e) =>
            setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });

        setClosetItems((prev) => [...res.data.outfits, ...prev]);
        displayMessage(
          `${res.data.outfits.length} item(s) added successfully!`,
          "success"
        );
      } else {
        const res = await axios.put(
          `${OUTFIT_API_URL}/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setClosetItems((prev) =>
          prev.map((item) => (item._id === editingId ? res.data.outfit : item))
        );

        setEditingId(null);
        displayMessage("Item updated successfully!", "success");
      }

      setFormData({
        name: "",
        category: "",
        color: "",
        season: "",
        occasion: "",
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setUploadProgress(0);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      displayMessage(`Failed to save item. ${msg}`, "error");
      if (error.response?.status === 401)
        setTimeout(() => navigate("/login"), 1500);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  // ---------------- Edit Item ----------------
  const handleEdit = (itemId) => {
    const item = closetItems.find((i) => i._id === itemId);
    if (!item) return;

    setFormData({
      name: item.name || "",
      category: item.category || "",
      color: item.color || "",
      season: item.season || "",
      occasion: item.occasion || "",
    });

    setImagePreviews(item.imageUrl ? [item.imageUrl] : []);
    setSelectedFiles([]);
    setEditingId(itemId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- Delete Item ----------------
  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${OUTFIT_API_URL}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClosetItems((prev) => prev.filter((item) => item._id !== itemId));
      displayMessage("Item deleted successfully!", "success");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      displayMessage(`Failed to delete item. ${msg}`, "error");
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  // ---------------- Filter Items ----------------
  const filteredItems = closetItems.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.color?.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- Render Single Item ----------------
  const renderItem = (item) => (
    <div
      key={item._id}
      className="bg-white rounded-xl shadow-md overflow-hidden animate-fadeIn"
    >
      <ImageRenderer
        imageUrl={item.imageUrl}
        altText={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium text-gray-800 capitalize">{item.name}</h3>
        <p className="text-sm text-gray-500 capitalize">
          {item.category} • {item.color || "—"}
        </p>
        {(item.season || item.occasion) && (
          <p className="text-xs text-gray-400 mt-1 capitalize">
            {[item.season, item.occasion].filter(Boolean).join(" • ")}
          </p>
        )}
        <div className="flex justify-between mt-3">
          <button
            onClick={() => handleEdit(item._id)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={loading}
            className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">
            👗 My Closet
          </h1>

          {appMessage.text && (
            <div
              className={`p-3 rounded-lg mb-6 text-white text-center ${
                appMessage.type === "error"
                  ? "bg-red-600"
                  : appMessage.type === "info"
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}
            >
              {appMessage.text}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {editingId !== null ? "✏️ Edit Item" : "➕ Add New Item"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              <input
                type="text"
                name="name"
                placeholder="Item Name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full capitalize"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="color"
                placeholder="Color"
                value={formData.color}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
              />
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full capitalize"
              >
                <option value="">Select Season</option>
                {seasons.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full capitalize"
              >
                <option value="">Select Occasion</option>
                {occasions.map((o) => (
                  <option key={o} value={o.toLowerCase()}>
                    {o}
                  </option>
                ))}
              </select>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleChange}
                disabled={loading || editingId !== null}
                className={`border p-2 rounded-lg w-full col-span-1 sm:col-span-2 md:col-span-3 ${
                  editingId !== null ? "opacity-50" : ""
                }`}
              />

              <div className="flex flex-wrap gap-2 col-span-1 sm:col-span-2 md:col-span-3">
                {imagePreviews.map((url, i) => (
                  <img
                    key={i}
                    src={
                      url.startsWith("data:")
                        ? url
                        : `${API_URL}/${url.replace(/^uploads\//, "")}`
                    }
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => (e.target.src = placeholderImg)}
                  />
                ))}
                {editingId === null &&
                  uploadProgress > 0 &&
                  uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-cyan-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
              </div>

              <div className="col-span-1 sm:col-span-2 md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  disabled={loading || isUpdating}
                  className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {editingId !== null ? "Update Item" : "Add Item"}
                </button>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
              👚 Your Closet ({closetItems.length})
            </h2>
            <input
              type="text"
              placeholder="Search by name, category, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="border border-gray-300 rounded-lg p-2 w-full sm:w-64 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Display Items */}
          {(loading && uploadProgress === 0) || isUpdating ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="text-gray-500 mt-2">
                {isUpdating
                  ? "Processing update..."
                  : "Loading your closet items..."}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              {closetItems.length === 0
                ? "No items found. Try adding some! 🧺"
                : "No items match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => renderItem(item))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyCloset;
