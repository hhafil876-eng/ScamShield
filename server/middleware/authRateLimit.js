const crypto = require("node:crypto");
const AuthAttempt = require("../models/authAttempt");
const windowMs = 15 * 60 * 1000;
const limit = 20;

module.exports = async (req, res, next) => {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const addressHash = crypto.createHmac("sha256", process.env.JWT_SECRET).update(req.rateLimitAddress || req.ip).digest("hex");
  const key = `${addressHash}:${windowStart}`;
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt) } };
  try {
    let entry;
    try {
      entry = await AuthAttempt.findOneAndUpdate({ _id: key }, update, { upsert: true, returnDocument: "after" });
    } catch (error) {
      if (error.code !== 11000) throw error;
      entry = await AuthAttempt.findOneAndUpdate({ _id: key }, { $inc: { count: 1 } }, { returnDocument: "after" });
    }
    if (entry.count > limit) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
      return res.status(429).json({ success: false, message: "Too many authentication attempts. Please try again later." });
    }
    return next();
  } catch {
    return res.status(503).json({ success: false, message: "Authentication is temporarily unavailable." });
  }
};
