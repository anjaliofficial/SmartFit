import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../components/HeaderAfterLogin";
import Footer from "../components/Footer";

// ✅ CRITICAL FIX: Set API_URL to the full backend server address (assuming port 5000)
const API_URL = "http://localhost:5000/api/outfits";

const MyCloset = () => {
  // State for data returned from the server (MongoDB items)
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for form metadata inputs
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    season: "",
    occasion: "",
  });

  // State to hold the actual File objects (required for Multer upload on the server)
  const [selectedFiles, setSelectedFiles] = useState([]);

  // State to hold Base64 for local preview *only*
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

  // --- Helper: Convert files to Base64 (for PREVIEW only) ---
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

  // --- Handlers ---
  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "images" && files && files.length > 0) {
      const selected = Array.from(files).slice(0, 5);

      // 1. Store the actual File objects for server submission
      setSelectedFiles(selected);

      // 2. Generate Base64 for immediate visual preview
      const base64Images = await convertToBase64(selected);
      setImagePreviews(base64Images);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- API Fetch Function ---
  const fetchClosetItems = useCallback(async () => {
    try {
      setLoading(true);
      // GET http://localhost:5000/api/outfits
      const response = await axios.get(API_URL, {
        withCredentials: true, // ✅ IMPORTANT: Ensures cookies/auth headers are sent
      });
      // Ensure the server returns { success: true, outfits: [...] }
      const outfits = response.data.outfits || [];

      // ✅ FIX: Filter out any undefined or invalid items
      const validOutfits = outfits.filter(
        (item) => item && typeof item === "object" && item.name !== undefined
      );

      setClosetItems(validOutfits);
    } catch (error) {
      console.error("Error fetching closet items:", error);
      setClosetItems([]); // Set to empty array on failure to prevent filter error
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Initial Fetch Hook ---
  useEffect(() => {
    fetchClosetItems();
  }, [fetchClosetItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isNewItem = editingIndex === null;

    if (!formData.name || !formData.category) {
      alert("Please fill name and category!");
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
        // --- ADD NEW ITEM (POST with files) ---
        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("color", formData.color);
        data.append("season", formData.season);
        data.append("occasion", formData.occasion);

        // Append actual File objects using the backend's expected field name: 'item_images'
        selectedFiles.forEach((file) => {
          data.append("item_images", file);
        });

        // POST http://localhost:5000/api/outfits/upload
        const response = await axios.post(`${API_URL}/upload`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // ✅ IMPORTANT: Ensures cookies/auth headers are sent
        });

        // ✅ FIX: Use functional update to ensure we have latest state
        setClosetItems((prevItems) => [response.data.outfit, ...prevItems]);
      } else {
        // --- EDIT EXISTING ITEM (PUT, metadata only) ---
        const itemToUpdate = closetItems[editingIndex];

        // PUT http://localhost:5000/api/outfits/:id
        const response = await axios.put(
          `${API_URL}/${itemToUpdate._id}`,
          formData,
          { withCredentials: true } // ✅ IMPORTANT: Ensures cookies/auth headers are sent
        );

        // ✅ FIX: Use functional update
        setClosetItems((prevItems) => {
          const updated = [...prevItems];
          updated[editingIndex] = response.data.outfit;
          return updated;
        });
        setEditingIndex(null);
      }

      // Reset form states
      setFormData({
        name: "",
        category: "",
        color: "",
        season: "",
        occasion: "",
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error submitting item:", error);
      alert(
        `Failed to save item. Error: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const item = closetItems[index];
    // ✅ FIX: Add safety check for item existence
    if (!item) {
      console.error("Item not found at index:", index);
      return;
    }

    setFormData({
      name: item.name || "",
      category: item.category || "",
      color: item.color || "",
      season: item.season || "",
      occasion: item.occasion || "",
    });
    // Clear files/preview on edit since we are only updating metadata
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      const itemToDelete = closetItems[index];

      // ✅ FIX: Add safety check for item existence
      if (!itemToDelete) {
        console.error("Item not found at index:", index);
        setLoading(false);
        return;
      }

      try {
        // DELETE http://localhost:5000/api/outfits/:id
        await axios.delete(`${API_URL}/${itemToDelete._id}`, {
          withCredentials: true, // ✅ IMPORTANT: Ensures cookies/auth headers are sent
        });
        // ✅ FIX: Use functional update
        setClosetItems((prevItems) => prevItems.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item.");
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ FIX: Safe filtering with proper null checks
  const filteredItems = closetItems.filter((item) => {
    // Skip undefined or invalid items
    if (!item || typeof item !== "object") return false;

    const itemName = item.name || "";
    const itemCategory = item.category || "";
    const itemColor = item.color || "";

    const searchTerm = search.toLowerCase();

    return (
      itemName.toLowerCase().includes(searchTerm) ||
      itemCategory.toLowerCase().includes(searchTerm) ||
      itemColor.toLowerCase().includes(searchTerm)
    );
  });

  // ✅ FIX: Safe item rendering function
  const renderItem = (item, index) => {
    // Double-check item validity before rendering
    if (!item || !item._id) {
      console.warn("Invalid item found at index:", index, item);
      return null;
    }

    const itemName = item.name || "Unnamed Item";
    const itemCategory = item.category || "Uncategorized";
    const itemColor = item.color || "—";
    const itemSeason = item.season || "";
    const itemOccasion = item.occasion || "";
    const itemImageUrl = item.imageUrl || "";

    return (
      <div
        key={item._id}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* ✅ FIX: Proper image URL handling with fallback */}
        <img
          src={
            itemImageUrl.startsWith("http")
              ? itemImageUrl
              : `http://localhost:5000/${itemImageUrl}`
          }
          alt={itemName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTBiMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+";
            e.target.alt = "Image not available";
          }}
        />
        <div className="p-4">
          <h3 className="font-medium text-gray-800">{itemName}</h3>
          <p className="text-sm text-gray-500">
            {itemCategory} • {itemColor}
          </p>
          {(itemSeason || itemOccasion) && (
            <p className="text-xs text-gray-400 mt-1">
              {[itemSeason, itemOccasion].filter(Boolean).join(" • ")}
            </p>
          )}
          <div className="flex justify-between mt-3">
            <button
              onClick={() => handleEdit(index)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(index)}
              disabled={loading}
              className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
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

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {editingIndex !== null
                ? "✏️ Edit Item Metadata"
                : "➕ Add New Item"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {/* Form Fields: Name, Category, Color, Season, Occasion */}
              <div>
                <label className="block text-gray-600 mb-2">Item Name</label>
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
                <label className="block text-gray-600 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
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
                  {seasons.map((s, i) => (
                    <option key={i} value={s}>
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
                  {occasions.map((o, i) => (
                    <option key={i} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div className="col-span-1 md:col-span-3">
                <label className="block text-gray-600 mb-2">
                  Upload Images (Max 5)
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  disabled={editingIndex !== null} // Disable file upload on edit
                />
                {editingIndex !== null && (
                  <p className="text-sm text-red-500 mt-1">
                    Edit mode: Image cannot be changed. Delete and re-add to
                    change the photo.
                  </p>
                )}
              </div>

              {/* Preview Images */}
              {imagePreviews.length > 0 && (
                <div className="col-span-3 flex flex-wrap justify-center gap-3 mt-4">
                  {imagePreviews.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`preview-${i}`}
                      className="w-28 h-28 object-cover rounded-xl border-2 border-cyan-400"
                    />
                  ))}
                </div>
              )}

              <div className="col-span-3 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving..."
                    : editingIndex !== null
                    ? "Update Metadata"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>

          {/* Closet Items */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-700">
              👚 Your Closet ({closetItems.length} items)
            </h2>
            <input
              type="text"
              placeholder="Search item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-56 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {loading ? (
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
