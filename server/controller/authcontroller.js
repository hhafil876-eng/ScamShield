const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const User = require("../models/user");
const AuthSession = require("../models/authSession");
const {
  generateCsrfToken,
  setAuthCookies,
  clearAuthCookies,
} = require("../middleware/csrfMiddleware");

/* ================================
   JWT
================================ */

const generateToken = async (userId) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      jwtid: tokenId,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
  await AuthSession.create({ _id: tokenId, userId, expiresAt: new Date(jwt.decode(token).exp * 1000) });
  return token;
};

/* ================================
   REGISTER
================================ */

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 ||
        typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Account already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
    });

    const token = await generateToken(user._id);
    const csrfToken = generateCsrfToken(token);

    // Set HttpOnly cookie for token & readable cookie for CSRF
    setAuthCookies(res, token, csrfToken);

    return res.status(201).json({
      success: true,
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        joined: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Account already exists." });
    }
    console.error("Register operation failed.");

    return res.status(500).json({
      success: false,
      message: "Server error while creating account.",
    });
  }
};

/* ================================
   LOGIN
================================ */

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== "string" || !password || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const correctPassword = await user.matchPassword(password);

    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = await generateToken(user._id);
    const csrfToken = generateCsrfToken(token);

    // Set HttpOnly cookie for token & readable cookie for CSRF
    setAuthCookies(res, token, csrfToken);

    return res.json({
      success: true,
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        joined: user.createdAt,
      },
    });
  } catch {
    console.error("Login operation failed.");

    return res.status(500).json({
      success: false,
      message: "Server error while logging in.",
    });
  }
};

/* ================================
   LOGOUT
================================ */

const logoutUser = async (req, res) => {
  const token = req.cookies?.scamshield_token;
  let decoded;
  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      // Expired or invalid tokens can still have their browser cookies cleared.
    }
  }
  if (decoded?.jti) {
    try {
      await AuthSession.deleteOne({ _id: decoded.jti, userId: decoded.userId });
    } catch {
      return res.status(503).json({ success: false, message: "Unable to end the session. Please try again." });
    }
  }
  clearAuthCookies(res);
  return res.json({
    success: true,
    message: "Logged out successfully.",
  });
};

/* ================================
   GET CURRENT USER (ME)
================================ */

const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        joined: req.user.createdAt,
      },
    });
  } catch {
    console.error("Profile retrieval failed.");
    return res.status(500).json({
      success: false,
      message: "Server error retrieving user data.",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id });
  } catch {
    return res.status(503).json({ success: false, message: "Unable to delete the account. Please try again." });
  }
  // Deleted users fail authentication even if session cleanup is temporarily unavailable.
  try {
    await AuthSession.deleteMany({ userId: req.user._id });
  } catch {
    console.error("Deleted account session cleanup deferred until expiration.");
  }
  clearAuthCookies(res);
  return res.json({ success: true, message: "Account deleted." });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  deleteAccount,
};
