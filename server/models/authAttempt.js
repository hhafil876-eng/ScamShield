const mongoose = require("mongoose");

const authAttemptSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});

module.exports = mongoose.models.AuthAttempt || mongoose.model("AuthAttempt", authAttemptSchema);
