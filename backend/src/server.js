import express from "express";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.routes.js";
import chatRoutes from "./routes/chat.route.js";
import SocketService from "./lib/socketService.js";
import bodyParser from "body-parser";
import http from "http"; // ✅ Needed to create server

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/hello", (req, res) => {
  res.send("Hello from backend!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Pass HTTP server to socket service
const socketService = new SocketService(server);
app.set("socketService", socketService);

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
