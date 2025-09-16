const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  // Remove confirmPassword from here!
});

module.exports = mongoose.model('User', userSchema);