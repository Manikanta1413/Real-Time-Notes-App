const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { addComment } = require("../controllers/comment.controller");

router.post("/:noteId", authMiddleware, addComment);

module.exports = router;
