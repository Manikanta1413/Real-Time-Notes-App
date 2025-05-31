const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const Log = require("../models/log.model");

exports.addComment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    const comment = await Comment.create(
      [{ noteId, userId: req.user.id, content }],
      { session }
    );

    // Log the activity
    await Log.create([{
      userId: req.user.id,
      noteId,
      action: "commented",
      message: `Commented on note`,
      }],
      { session }
    );
    await session.commitTransaction();
    logger.info(
      `✅ Deleted the notes successfully for the user : ${req.user.id}`
    );
    res.status(201).json({ success: true, statusCode: 201, data: { message: "Comment added", comment: comment[0] } });

  } catch (error) {
    await session.abortTransaction();
    logger.error(`❌ Comment Failed due to ${error}`);
    res.status(400).json({ success: false, statusCode: 400, data: { error: "Comment failed" } });
  } finally {
    session.endSession();
  }
};
