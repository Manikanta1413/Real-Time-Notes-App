const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const ChatRequest = require("../models/chatRequest.model");
const Note = require("../models/note.model");
const Group = require("../models/group.model");

let ioInstance;

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      console.error("Socket Auth Failed:", error.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // === Request Chat ===
    socket.on("chat:request", async ({ toUsername }) => {
      const toUser = await User.findOne({ name: toUsername });
      if (!toUser) return socket.emit("chat:error", "User not found");

      const request = await ChatRequest.create({
        from: socket.user.id,
        to: toUser._id,
        status: "pending",
      });

      socket.to(toUser._id.toString()).emit("chat:request-received", {
        from: socket.user.id,
        requestId: request._id,
      });
    });

    // === Approve Chat Request ===
    socket.on("chat:approve", async ({ requestId }) => {
      const request = await ChatRequest.findById(requestId);
      if (!request || request.status !== "pending") return;

      request.status = "approved";
      await request.save();

      const roomId = [request.from.toString(), request.to.toString()]
        .sort()
        .join("_");
      socket.join(roomId);
      socket.to(request.from.toString()).emit("chat:approved", { roomId });
    });

    // === Reject Chat Request ===
    socket.on("chat:reject", async ({ requestId }) => {
      const request = await ChatRequest.findById(requestId);
      if (request) {
        request.status = "rejected";
        await request.save();
        socket.to(request.from.toString()).emit("chat:rejected");
      }
    });

    // === Send Message (1-1 Chat) ===
    socket.on("chat:message", async ({ roomId, message }) => {
      const chat = await Chat.create({
        roomId,
        sender: socket.user.id,
        message,
      });
      io.to(roomId).emit("chat:message", chat);
    });

    // === Join Group Room ===
    socket.on("group:join", async ({ groupId }) => {
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(socket.user.id)) {
        return socket.emit("group:error", "Access denied");
      }
      socket.join(groupId);
    });

    // === Group Chat Message ===
    socket.on("group:message", async ({ groupId, message }) => {
      const chat = await Chat.create({
        groupId,
        sender: socket.user.id,
        message,
      });
      io.to(groupId).emit("group:message", chat);
    });

    // === Share Note in Chat ===
    socket.on("chat:share-note", async ({ roomId, noteId }) => {
      const note = await Note.findOne({ _id: noteId, user: socket.user.id });
      if (!note) return socket.emit("error", "Note not found");

      io.to(roomId).emit("chat:shared-note", {
        sharedBy: socket.user.id,
        note,
      });
    });
  });
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};

module.exports = { setupSocket, getIO };
