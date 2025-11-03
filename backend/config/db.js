// config/db.js (Corrected for ES Modules)
import mongoose from 'mongoose'; // Changed from require()

const connectDB = async (mongoURI) => {
  try {
    // Note: The new Mongoose driver handles options automatically
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Use process.exit(1) to stop the process if connection fails
    process.exit(1); 
  }
};

// CHANGED: Use ES Module default export
export default connectDB;