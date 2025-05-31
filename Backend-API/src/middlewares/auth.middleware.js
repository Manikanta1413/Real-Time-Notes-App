const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");

exports.authMiddleware = async (req, res, next) => {
  let token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    logger.error(`❌ Not authorized, token missing for the user`);
    return res
      .status(401)
      .json({
        success: false,
        statusCode: 401,
        data: { error: "Not authorized, token missing" },
      });
  } 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      logger.error(`❌ Not authorized, user not found`);
      return res.status(401).json({
        success: false,
        statusCode: 401,
        data: { error: "Not authorized, user not found" },
      });
    }
    logger.info(`✅ Access Granted for the user`);
    next();
  } catch (error) {
    logger.error(`❌ Invalid Token`);
    return res
      .status(401)
      .json({
        success: false,
        statusCode: 401,
        data: { error: "Invalid token" },
      });
  }
};

