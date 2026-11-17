const express = require("express");
const router = express.Router();
const authRateLimit = require("../middleware/authRateLimit");
const { generateCsrfToken, setCsrfCookie } = require("../middleware/csrfMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  deleteAccount,
} = require("../controller/authcontroller");

const {
  protect,
} = require("../middleware/authmiddleware");

/* =========================================
   AUTH ROUTES
========================================= */

// Public routes
router.get("/csrf", (req, res) => {
  const csrfToken = generateCsrfToken(req.cookies?.scamshield_token || "");
  setCsrfCookie(res, csrfToken);
  res.json({ success: true, csrfToken });
});
router.post("/register", authRateLimit, registerUser);
router.post("/login", authRateLimit, loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/me", protect, getMe);
router.delete("/account", protect, deleteAccount);

module.exports = router;
