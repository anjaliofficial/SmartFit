// models/Outfit.js
import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ["top", "bottom", "footwear", "accessory", "outerwear", "others"],
      default: "others",
    },
    color: {
      type: String,
      default: "unknown",
    },
    season: {
      type: String,
      enum: ["spring", "summer", "fall", "winter", "all"],
      default: "all",
    },
    occasion: {
      type: String,
      enum: ["casual", "work", "formal", "sport", "party"],
      default: "casual",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      default: "casual",
    },
    pattern: {
      type: String,
      default: "plain",
    },
    dominantColors: [String],
  },
  {
    timestamps: true,
  }
);

const Outfit = mongoose.model("Outfit", outfitSchema);

export default Outfit;
