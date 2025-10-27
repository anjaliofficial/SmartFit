import mongoose from "mongoose";

const OutfitSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        trim: true, 
        default: "Unnamed Item" 
    },
    category: { 
        type: String, 
        required: true 
    },
    // This stores the path on the Node server (e.g., 'uploads/item_images-12345.jpg')
    imageUrl: { 
        type: String, 
        required: true 
    }, 
    color: { type: String },
    season: { type: String, default: "all" },
    occasion: { type: String, default: "casual" },
    style: { type: String },
    pattern: { type: String },
    dominantColors: [String],
}, { timestamps: true });

const Outfit = mongoose.model('Outfit', OutfitSchema);
export default Outfit;