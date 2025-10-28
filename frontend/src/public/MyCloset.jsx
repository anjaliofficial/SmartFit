import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";

// ✅ The fallback image is expected to be at the root of the public folder
const placeholderImg = "/placeholder.png";
const API_URL = "http://localhost:5000/api/outfits";

const MyCloset = () => {
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Convert uploaded files to Base64 for preview
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

  // ✅ Fetch closet items
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
      alert(
        "Failed to load closet items. Please ensure the backend is running."
      );
      setClosetItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClosetItems();
  }, [fetchClosetItems]);

  // ✅ Add or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    const isNewItem = editingIndex === null;

    if (!formData.name || !formData.category) {
      alert("Please fill in name and category!");
      setLoading(false);
      return;
    }

    if (isNewItem && selectedFiles.length === 0) {
      alert("Please upload at least one image for a new item!");
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
          const newOutfit = response.data.outfits[0] || response.data.outfit;
          if (newOutfit) {
            setClosetItems((prev) => [newOutfit, ...prev]);
            alert("Item added successfully!");
          } else {
            throw new Error("Item added but no data received");
          }
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
        alert("Item updated successfully!");
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
      alert(
        `Failed to save item. ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Edit existing item
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

  // ✅ Delete item
  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    const itemToDelete = closetItems[index];
    try {
      await axios.delete(`${API_URL}/${itemToDelete._id}`, {
        withCredentials: true,
      });
      setClosetItems((prev) => prev.filter((_, i) => i !== index));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter and search
  const filteredItems = closetItems.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const s = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(s) ||
      item.category?.toLowerCase().includes(s) ||
      item.color?.toLowerCase().includes(s)
    );
  });

  // ✅ Proper image URL resolver (FIXED)
  const getImageUrl = (item) => {
    if (!item.imageUrl) return placeholderImg;

    // 1. External URLs are returned directly
    if (item.imageUrl.startsWith("http")) return item.imageUrl;

    // 2. Paths stored as 'uploads/filename.jpg' (from backend fix)
    if (item.imageUrl.startsWith("uploads/"))
      return `http://localhost:5000/${item.imageUrl}`;

    // 3. Absolute path /uploads/filename.jpg (unlikely but safe to include)
    if (item.imageUrl.startsWith("/uploads/"))
      return `http://localhost:5000${item.imageUrl}`;

    // 4. Default fallback (if only filename is stored)
    return `http://localhost:5000/uploads/${item.imageUrl}`;
  };

  const renderItem = (item, index) => {
    if (!item || !item._id) return null;
    const imageUrl = getImageUrl(item);
    return (
      <div
        key={item._id}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        <img
          src={imageUrl}
          alt={item.name || "Unnamed Item"}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          // FIX: The onError handler is what causes the flicker if the placeholder fails.
          // Ensure it's correctly referencing the public asset.
          onError={(e) => {
            if (e.target.src !== placeholderImg) {
              e.target.src = placeholderImg;
            }
          }}
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-10">
            👗 My Closet
          </h1>

          {/* Add/Edit Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {editingIndex !== null ? "✏️ Edit Item" : "➕ Add New Item"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {/* Inputs */}
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

              <div className="col-span-3 flex justify-center">
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

          {/* ✅ Closet Grid */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-700">
              👚 Your Closet ({closetItems.length} items)
            </h2>
            <input
              type="text"
              placeholder="Search by name, category, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
