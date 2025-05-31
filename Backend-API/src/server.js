require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const http = require("http"); 
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const noteRoutes = require("./routes/note.routes");
const commentRoutes = require("./routes/comment.routes");
const { setupSocket } = require("./sockets/chat");
const { errorHandler } = require("./middlewares/errorHandler.middleware");

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

// Routes
app.get("/", (req, res) => {
  res.send("Real Time Collaborative Notes App");
});
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/comments", commentRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB and start server
const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  setupSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server running on port ... ${PORT}`);
  });
}

startServer();