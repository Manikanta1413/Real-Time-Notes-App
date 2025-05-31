const mongoose = require("mongoose");
const Note = require("../models/note.model");
const logger = require("../utils/logger");
const Log = require("../models/log.model");
const { getIO } = require("../sockets/chat"); 

// POST /api/notes/  ----  CREATE NOTES
exports.createNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("📨 Empty payload received for creating new Notes : /notes ");
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: { error: "Payload is required" },
      });
    }

    const title = req.body.title?.trim();
    const content = req.body.content?.trim();

    const note = await Note.create([{ title, content, user: req.user.id }], {
      session,
    });

    await Log.create(
      [
        {
          user: req.user.id,
          note: note[0]._id,
          action: "create",
          message: `Note created by ${req.user.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    const io = getIO();
    io.emit("note:created", note); 

    logger.info(
      `✅ New note created and logged successfully for user: ${req.user.name}`
    );
    res.status(201).json({ success: true, statusCode: 201, data: { note } });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`❌ Error in transaction while creating note: ${error}`);
    res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Failed to create note" },
    });
  }
};

// GET /api/notes  ----   GET ALL NOTES FOR USER
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });

    logger.info(`✅ Fetched all the notes for the user : ${req.user.name}`);
    res.status(200).json({ success: true, statusCode: 200, data: { notes } });
  } catch (error) {
    logger.error(`❌ Error fetching notes due to ${error}`);
    res.status(400).json({ error: "Error fetching notes" });
  }
};

// PUT /api/notes/:id  ----  UPDATE SINGLE NOTE
exports.updateNote = async (req, res) => {
  const session = await Note.startSession();
  session.startTransaction();

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      req.body,
      { new: true, runValidators: true, session }
    );

    if (!updatedNote) {
      await session.abortTransaction();
      session.endSession();
      logger.error(
        `❌ Note not found or unauthorized access for id: ${req.params.id}`
      );
      return res.status(404).json({
        success: false,
        statusCode: 404,
        data: { error: "Note not found or unauthorized" },
      });
    }

    await Log.create(
      [
        {
          user: req.user.id,
          note: updatedNote._id,
          action: "update",
          message: `Note updated by ${req.user.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Emit updated note to all connected clients
    const io = getIO();
    io.emit("note:updated", updatedNote);

    logger.info(
      `✅ Updated note for user ${req.user.id}, note ID: ${req.params.id}`
    );

    res
      .status(200)
      .json({ success: true, statusCode: 200, data: { note: updatedNote } });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`❌ Error updating note: ${error}`);
    res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Error updating note" },
    });
  }
};


// DELETE /api/notes/:id  ----  DELETE SINGLE NOTE
exports.deleteNote = async (req, res) => {
  const session = await Note.startSession();
  session.startTransaction();

  try {
    const noteId = req.params.id;
    const note = await Note.findOneAndDelete(
      {
        _id: noteId,
        user: req.user.id,
      },
      { session }
    );

    if (!note) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`❌ Note not found for the notes id : ${noteId}`);
      return res.status(404).json({
        success: false,
        statusCode: 404,
        data: { error: "Note not found" },
      });
    }

    await Log.create(
      [
        {
          user: req.user.id,
          note: note._id,
          action: "delete",
          message: `Note deleted by ${req.user.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Emit note deletion
    const io = getIO();
    io.emit("note:deleted", { noteId });

    logger.info(
      `✅ Deleted the notes successfully for the user : ${req.user.id}`
    );  

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: { message: "Note deleted successfully!" },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`❌Error while deleting the note due to ${error}`);
    res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Error deleting note" },
    });
  }
};

// PUT /api/notes/bulk/update  ----  BULK UPDATE
exports.bulkUpdateNotes = async (req, res) => {
  const session = await Note.startSession();
  session.startTransaction();

  try {
    const { noteIds, updateFields } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      logger.error(`❌Received empty noteIds, so not able to do bulk update`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: { error: "noteIds must not be empty" },
      });
    }

    if (
      !updateFields ||
      typeof updateFields !== "object" ||
      Object.keys(updateFields).length === 0
    ) {
      logger.error(`❌Update fields must be non-empty object`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: { error: "updateFields must be non-empty" },
      });
    }

    const result = await Note.updateMany(
      { _id: { $in: noteIds }, user: req.user.id },
      { $set: updateFields },
      { session }
    );
    await Log.create([{
      user: req.user.id,
      action: "bulk-update",
      message: `${noteIds.length} notes updated in bulk by ${req.user.name}`,
    }],{ session });
    

    await session.commitTransaction();
    session.endSession();

    logger.info(
      `✅ Notes updated successfully. matchedCount : ${result.matchedCount}, modifiedCount : ${result.modifiedCount}`
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        message: "Notes updated successfully",
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`❌Error while performing bulk update due to : ${error}`);
    res.status(400).json({
      success: false,
      statusCode: 400,
      data: { error: "Error performing bulk update" },
    });
  }
};
