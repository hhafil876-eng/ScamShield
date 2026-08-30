const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

/* ================================
   MIDDLEWARE
================================ */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ================================
   ROUTES
================================ */

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

/* ================================
   TEST ROUTE
================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "ScamShield Security API Online 🛡️",
  });
});

/* ================================
   SERVER
================================ */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🛡️ ScamShield API running on port ${PORT}`
  );
});