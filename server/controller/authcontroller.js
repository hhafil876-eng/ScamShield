const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ================================
   JWT
================================ */

const generateToken = (
  userId
) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/* ================================
   REGISTER
================================ */

const registerUser =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "All fields are required.",
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must contain at least 6 characters.",
          });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email:
            cleanEmail,
        });

      if (existingUser) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Account already exists.",
          });
      }

      const user =
        await User.create({
          name:
            name.trim(),
          email:
            cleanEmail,
          password,
        });

      const token =
        generateToken(
          user._id
        );

      res.status(201).json({
        success: true,

        token,

        user: {
          id:
            user._id,
          name:
            user.name,
          email:
            user.email,
          joined:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while creating account.",
      });
    }
  };

/* ================================
   LOGIN
================================ */

const loginUser =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email and password are required.",
          });
      }

      const user =
        await User.findOne({
          email:
            email
              .trim()
              .toLowerCase(),
        }).select(
          "+password"
        );

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid email or password.",
          });
      }

      const correctPassword =
        await user.matchPassword(
          password
        );

      if (
        !correctPassword
      ) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid email or password.",
          });
      }

      const token =
        generateToken(
          user._id
        );

      res.json({
        success: true,

        token,

        user: {
          id:
            user._id,
          name:
            user.name,
          email:
            user.email,
          joined:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while logging in.",
      });
    }
  };

module.exports = {
  registerUser,
  loginUser,
};