const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    console.warn("⚠️ Warning: Neither MONGO_URI nor MONGO_URL is set in environment variables.");
    return null;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected.");
    return connection;
  } catch {
    console.error("MongoDB connection failed. Authentication readiness is unavailable.");
    return null;
  }
};

module.exports = connectDB;
