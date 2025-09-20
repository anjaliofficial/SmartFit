const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,   // Make it mandatory
    trim: true        // Remove extra spaces
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
}, { timestamps: true }); // optional: adds createdAt & updatedAt

module.exports = mongoose.model("User", userSchema);
