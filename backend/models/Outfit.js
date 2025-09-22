import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["shirt","pants","shoes","jacket","accessories","bag"], required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Outfit", outfitSchema);
