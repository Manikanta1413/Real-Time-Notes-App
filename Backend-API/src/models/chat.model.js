const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
