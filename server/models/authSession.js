const mongoose = require("mongoose");

const authSessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

module.exports = mongoose.models.AuthSession || mongoose.model("AuthSession", authSessionSchema);
