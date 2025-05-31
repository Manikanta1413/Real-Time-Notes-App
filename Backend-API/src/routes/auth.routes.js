const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/auth.controller");

const {
  registerSchema,
  loginSchema,
  validateBody,
} = require("../validations/userValidation");

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);

module.exports = router;
