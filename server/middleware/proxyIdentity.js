const crypto = require("node:crypto");
const { isIP } = require("node:net");

module.exports = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  const expected = Buffer.from(process.env.PROXY_SHARED_SECRET || "");
  const supplied = Buffer.from(req.get("x-scamshield-proxy-secret") || "");
  if (expected.length < 32 || supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return res.status(403).json({ success: false, message: "Use the ScamShield frontend to access authentication." });
  }
  const raw = req.get("x-real-ip") || (req.get("x-forwarded-for") ? req.get("x-forwarded-for").split(",")[0].trim() : null) || req.socket?.remoteAddress;
  const address = raw && isIP(raw) ? raw : null;
  if (!address) {
    return res.status(400).json({ success: false, message: "A verified client address is required." });
  }
  req.rateLimitAddress = address;
  return next();
};
