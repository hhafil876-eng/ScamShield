const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AuthSession = require("../models/authSession");

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check HttpOnly cookie first (primary secure transport)
    if (req.cookies && req.cookies.scamshield_token) {
      token = req.cookies.scamshield_token;
    }
    // 2. Fallback to Authorization: Bearer <token>
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded.jti !== "string" || !await AuthSession.exists({
      _id: decoded.jti, userId: decoded.userId, expiresAt: { $gt: new Date() },
    })) {
      return res.status(401).json({ success: false, message: "Session has ended. Please log in again." });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  protect,
};
