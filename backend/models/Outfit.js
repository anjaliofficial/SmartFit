import mongoose from "mongoose";

const OutfitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, trim: true, default: "Unnamed Item" },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true }, 
  color: { type: String },
  season: { type: String, default: "all" },
  occasion: { type: String, default: "casual" },
  style: { type: String },
  pattern: { type: String },
  dominantColors: [Array],
}, { timestamps: true });

export default mongoose.model('Outfit', OutfitSchema);