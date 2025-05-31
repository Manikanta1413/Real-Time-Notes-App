const User = require("../models/user.model");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("📨 Empty payload received on /register");
      res.status(400);
      return res.status(400).json({ success: false, statusCode: 400, data: { error: "Payload is required" } });
    }
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`🚫 Registration attempt with existing email: ${email}`);
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: { error: "User already exists" },
      });
    }

    const newUser = await User.create({ name, email, password });

    logger.info(`✅ New user registered: ${email}`);

    const token = generateToken(newUser);

    res
      .status(201)
      .cookie("token", token, { httpOnly: true })
      .json({
        success: true,
        statusCode : 201,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  } catch (error) {
    logger.error(`❌ Register failed: ${error.message}`);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Registration failed" },
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("📨 Empty payload received on /login");
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: { error: "Payload is required" },
      });
    }

    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`🚫 Login failed for non-existent user: ${email}`);
      return res.status(404).json({
        success: false,
        statusCode: 404,
        data: { error: "User not found" },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`🚫 Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        statusCode: 401,
        data: { error: "Invalid Credentials" },
      });
    }

    const token = generateToken(user);

    logger.info(`✅ User logged in: ${email}`);

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json({
        success: true,
        statusCode: 200,
        message: "Login successful",
        user: {
          token,
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    logger.error(
      `❌ Login error for ${req.body.email || "unknown user"}: ${error.message}`
    );
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Login Failed for the user" },
    });
  }
};


// POST /api/auth/logout
exports.logout = (_req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, statusCode: 200, data: { message: "Logged out successfully" } });
  logger.info("👋 User logged out");
};