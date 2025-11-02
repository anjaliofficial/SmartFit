import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";

const placeholderImg = "/placeholder.png";
const API_URL = "http://localhost:5000/api/outfits";

// ----------------------------------------------------
// ImageRenderer Component
// ----------------------------------------------------
const ImageRenderer = ({ imageUrl, altText, className }) => (
  <img
    src={imageUrl}
    alt={altText}
    className={className}
    onError={(e) => (e.target.src = placeholderImg)}
  />
);

// ----------------------------------------------------
const MyCloset = () => {
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");

  const categories = [
    "Tops",
    "Bottoms",
    "Dresses",
    "Outerwear",
    "Shoes",
    "Accessories",
    "Bags",
    "Sportswear",
    "Formal Wear",
    "Others",
  ];
  const seasons = ["Summer", "Winter", "Spring", "Autumn"];
  const occasions = ["Casual", "Formal", "Party", "Outdoor", "Work", "Other"];

  // Helper to display messages
  const displayMessage = useCallback((text, type = "success") => {
    setAppMessage({ text, type });
    const timeout = setTimeout(
      () => setAppMessage({ text: null, type: null }),
      5000
    );
    return () => clearTimeout(timeout);
  }, []);

  const handleCancelEdit = () => {
    setEditingIndex(null);
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

  const convertToBase64 = (files) =>
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files && files.length > 0) {
      const selected = Array.from(files).slice(0, 5);
      setSelectedFiles(selected);
      const base64Images = await convertToBase64(selected);
      setImagePreviews(base64Images);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Fetch closet items
  const fetchClosetItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, { withCredentials: true });
      const outfits = response.data.outfits || [];
      const validOutfits = outfits.filter(
        (item) => item && typeof item === "object" && item.name
      );
      setClosetItems(validOutfits);
    } catch (error) {
      console.error("Error fetching closet items:", error);
      displayMessage("Failed to load closet items. Check backend.", "error");
      setClosetItems([]);
    } finally {
      setLoading(false);
    }
  }, [displayMessage]);

  useEffect(() => {
    fetchClosetItems();
  }, [fetchClosetItems]);

  // Add or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    const isNewItem = editingIndex === null;

    if (!formData.name || !formData.category) {
      displayMessage("Please fill in item name and category!", "error");
      setLoading(false);
      return;
    }

    if (isNewItem && selectedFiles.length === 0) {
      displayMessage(
        "Please upload at least one image for a new item!",
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      if (isNewItem) {
        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => data.append(key, val));
        selectedFiles.forEach((file) => data.append("item_images", file));

        const response = await axios.post(`${API_URL}/upload`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (e) =>
            setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });

        if (response.data.success) {
          const newOutfits = response.data.outfits || [];
          setClosetItems((prev) => [...newOutfits, ...prev]);
          displayMessage("Item(s) added successfully!", "success");
        } else throw new Error(response.data.message || "Failed to add item");
      } else {
        const itemToUpdate = closetItems[editingIndex];
        const response = await axios.put(
          `${API_URL}/${itemToUpdate._id}`,
          formData,
          { withCredentials: true }
        );
        setClosetItems((prev) => {
          const updated = [...prev];
          updated[editingIndex] = response.data.outfit;
          return updated;
        });
        setEditingIndex(null);
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
      console.error("Error submitting item:", error);
      displayMessage(
        `Failed to save item. ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (index) => {
    const item = closetItems[index];
    if (!item) return;
    setFormData({
      name: item.name || "",
      category: item.category || "",
      color: item.color || "",
      season: item.season || "",
      occasion: item.occasion || "",
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    const itemToDelete = closetItems[index];
    try {
      await axios.delete(`${API_URL}/${itemToDelete._id}`, {
        withCredentials: true,
      });
      setClosetItems((prev) => prev.filter((_, i) => i !== index));
      displayMessage("Item deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting item:", error);
      displayMessage("Failed to delete item.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = closetItems.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const s = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(s) ||
      item.category?.toLowerCase().includes(s) ||
      item.color?.toLowerCase().includes(s)
    );
  });

  // Resolve image URL
  const getImageUrl = (item) => {
    if (!item.imageUrl) return placeholderImg;
    const filename = item.imageUrl.split("/").pop();
    return `http://localhost:5000/uploads/${filename}`;
  };

  const renderItem = (item, index) => {
    if (!item || !item._id) return null;
    return (
      <div
        key={item._id}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        <ImageRenderer
          imageUrl={getImageUrl(item)}
          altText={item.name || "Unnamed Item"}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="p-4">
          <h3 className="font-medium text-gray-800">
            {item.name || "Unnamed"}
          </h3>
          <p className="text-sm text-gray-500">
            {item.category || "Uncategorized"} • {item.color || "—"}
          </p>
          {(item.season || item.occasion) && (
            <p className="text-xs text-gray-400 mt-1">
              {[item.season, item.occasion].filter(Boolean).join(" • ")}
            </p>
          )}
          <div className="flex justify-between mt-3">
            <button
              onClick={() => handleEdit(index)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(index)}
              disabled={loading}
              className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getMessageClasses = () => {
    if (!appMessage.text) return "hidden";
    const base =
      "p-3 rounded-lg text-white font-medium mb-6 text-center transition-all duration-300";
    let typeClass =
      appMessage.type === "error"
        ? "bg-red-600"
        : appMessage.type === "info"
        ? "bg-blue-600"
        : "bg-green-600";
    return `${base} ${typeClass}`;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-start mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-semibold text-center mb-10">
            👗 My Closet
          </h1>
          <div className={getMessageClasses()}>{appMessage.text}</div>

          {/* Add/Edit Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {editingIndex !== null ? "✏️ Edit Item" : "➕ Add New Item"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {/* Form Inputs */}
              <div>
                <label className="block text-gray-600 mb-2">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., White Sneakers"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Blue, Black"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Season</label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Optional</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Occasion</label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Optional</option>
                  {occasions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="block text-gray-600 mb-2">
                  Upload Images (Max 5) {editingIndex === null && "*"}
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  disabled={editingIndex !== null}
                />
                {editingIndex !== null && (
                  <p className="text-sm text-red-500 mt-1">
                    Edit mode: Image cannot be changed. Delete and re-add to
                    change the photo.
                  </p>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="col-span-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="col-span-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`preview-${i}`}
                        className="w-28 h-28 object-cover rounded-xl border-2 border-cyan-400"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="col-span-3 flex justify-center space-x-4">
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="mt-4 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading
                    ? "Saving..."
                    : editingIndex !== null
                    ? "Update Item"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>

          {/* Closet Grid */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-700">
              👚 Your Closet ({closetItems.length} items)
            </h2>
            <input
              type="text"
              placeholder="Search by name, category, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="border border-gray-300 rounded-lg p-2 w-64 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {loading && !uploadProgress ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="text-gray-500 mt-2">Loading your closet items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">
              {closetItems.length === 0
                ? "No items found. Try adding some! 🧺"
                : "No items match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => renderItem(item, index))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyCloset;
