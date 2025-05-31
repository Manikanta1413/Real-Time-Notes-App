const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { createNote, getNotes, updateNote, deleteNote, bulkUpdateNotes} = require("../controllers/note.controller")

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);
router.put("/bulk/update", authMiddleware, bulkUpdateNotes);

module.exports = router;
