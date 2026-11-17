const path = require("path");
const dotenv = require("dotenv");

// Load .env explicitly from server directory or fallback to root directory
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { verifyCsrf } = require("./middleware/csrfMiddleware");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_ORIGIN) {
  throw new Error("CLIENT_ORIGIN is required in production.");
}
if (process.env.NODE_ENV === "production" && (!process.env.PROXY_SHARED_SECRET || process.env.PROXY_SHARED_SECRET.length < 32)) {
  throw new Error("PROXY_SHARED_SECRET must contain at least 32 characters in production.");
}
connectDB();

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY) {
  const proxies = process.env.TRUST_PROXY.split(",").map(value => value.trim());
  if (proxies.some(value => !value || value === "true" || value === "*" || /^\d+$/.test(value))) {
    throw new Error("TRUST_PROXY must contain explicit trusted proxy addresses or subnets.");
  }
  app.set("trust proxy", proxies);
}

/* ================================
   MIDDLEWARE
================================ */

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
if (process.env.NODE_ENV === "production") {
  const origin = new URL(clientOrigin);
  if (origin.protocol !== "https:" || origin.origin !== clientOrigin) {
    throw new Error("CLIENT_ORIGIN must be an exact HTTPS origin in production.");
  }
}
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [clientOrigin]
  : [clientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Required for HttpOnly cookies across origin
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use("/api/auth", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/api/auth", require("./middleware/proxyIdentity"));

// Double-submit CSRF protection middleware for non-safe mutating requests
app.use(verifyCsrf);
app.use("/api/auth", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: "Authentication service is temporarily unavailable." });
  }
  next();
});

/* ================================
   ROUTES
================================ */

app.use("/api/auth", require("./routes/authRoutes"));

/* ================================
   HEALTH & READINESS PROBES
================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ScamShield Security API Online",
  });
});

// Liveness probe: reports process running status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ScamShield API",
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe: accurately checks MongoDB state (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
app.get("/api/ready", (req, res) => {
  const state = mongoose.connection.readyState;
  const isConnected = state === 1;

  const stateLabels = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const statusObj = {
    ready: isConnected,
    database: {
      status: stateLabels[state] || "unknown",
      readyState: state,
    },
    timestamp: new Date().toISOString(),
  };

  if (!isConnected) {
    return res.status(503).json(statusObj);
  }

  return res.json(statusObj);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  return res.status(status).json({ success: false, message: "Unable to process request." });
});

/* ================================
   SERVER
================================ */

const PORT = process.env.PORT || 5000;

if (require.main === module && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`ScamShield API running on port ${PORT}`);
  });
}

module.exports = app;
