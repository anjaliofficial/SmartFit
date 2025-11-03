// models/User.js (Corrected for ES Modules)
import mongoose from "mongoose"; // Changed from require()

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  resetToken: { 
    type: String 
  },
  resetTokenExpiry: { 
    type: Date 
  }
}, { timestamps: true });

// CHANGED: Use ES Module default export
const User = mongoose.model("User", userSchema);

export default User;