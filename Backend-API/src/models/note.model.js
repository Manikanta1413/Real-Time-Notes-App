const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    labels: [String],
    archived: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
