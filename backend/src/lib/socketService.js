import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Message from "../models/Message.js";
import User from "../models/User.js";
import "dotenv/config";

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      },
      transports: ["websocket", "polling"],
      // Add max file size limit (10MB)
      maxHttpBufferSize: 10 * 1024 * 1024,
    });

    this.onlineUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // chatId -> Set of userIds

    // File size limits
    this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    this.ALLOWED_FILE_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "audio/mpeg", // .mp3
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "video/mp4",
    ];

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.jwt; // HTTP-only cookie

        if (!token) {
          return next(new Error("Authentication error: no token"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) return next(new Error("User not found"));

        socket.userId = userId;
        socket.user = user;

        next();
      } catch (err) {
        console.error("Socket authentication error:", err);
        next(new Error("Authentication error"));
      }
    });
  }

  // Helper method to convert file buffer to base64 data URL
  getFileUrl(fileData, fileName) {
    if (!fileData || !fileName) return null;

    // Get MIME type from file extension
    const ext = fileName.split(".").pop().toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      webm: "audio/webm",
      mp4: "video/mp4",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    const base64 = fileData.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected`);

      // Add user to online users
      this.onlineUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Broadcast updated online users list
      this.broadcastOnlineUsers();

      // Handle joining chat rooms
      socket.on("joinChat", async ({ chatId, userId }) => {
        try {
          if (userId !== socket.userId) {
            socket.emit("error", { message: "Unauthorized" });
            return;
          }

          socket.join(chatId);
          console.log(`User ${userId} joined chat ${chatId}`);
        } catch (error) {
          console.error("Error joining chat:", error);
          socket.emit("error", { message: "Failed to join chat" });
        }
      });

      // Handle loading messages
      socket.on("loadMessages", async ({ chatId }, callback) => {
        try {
          // Verify user is part of this chat
          const [userId1, userId2] = chatId.split("-");
          if (socket.userId !== userId1 && socket.userId !== userId2) {
            return callback({ success: false, error: "Unauthorized" });
          }

          const messages = await Message.find({
            chatId,
            deleted: { $ne: true },
          })
            .sort({ timestamp: 1 })
            .limit(100)
            .populate("senderId", "fullName username profilepic");

          callback({
            success: true,
            messages: messages.map((msg) => {
              const baseMessage = {
                _id: msg._id,
                content: msg.content, // Encrypted content from DB
                senderId: msg.senderId._id,
                receiverId: msg.receiverId,
                senderInfo: {
                  fullName: msg.senderId.fullName,
                  username: msg.senderId.username,
                  profilepic: msg.senderId.profilepic,
                },
                timestamp: msg.timestamp,
                read: msg.read,
                messageType: msg.messageType || "text",
                deleted: msg.deleted || false,
              };

              // Add file-specific data if it's a file message
              if (msg.messageType === "file") {
                baseMessage.fileName = msg.fileName;
                baseMessage.fileUrl = this.getFileUrl(
                  msg.fileData,
                  msg.fileName
                );
                baseMessage.fileSize = msg.fileData ? msg.fileData.length : 0;
              }

              return baseMessage;
            }),
          });
        } catch (error) {
          console.error("Error loading messages:", error);
          callback({ success: false, error: "Failed to load messages" });
        }
      });

      // Handle sending messages
      socket.on(
        "sendMessage",
        async ({ chatId, content, senderId, receiverId, tempId }, callback) => {
          try {
            // Validate that sender is the authenticated user
            if (senderId !== socket.userId) {
              const error = { message: "Unauthorized" };
              socket.emit("error", error);
              if (callback) callback({ success: false, error: error.message });
              return;
            }

            // Verify receiver exists and is a friend
            const receiver = await User.findById(receiverId);
            if (!receiver) {
              const error = { message: "Receiver not found" };
              socket.emit("error", error);
              if (callback) callback({ success: false, error: error.message });
              return;
            }

            // Create message in database (content is already encrypted from client)
            const message = new Message({
              chatId,
              content, // Encrypted content
              senderId,
              receiverId,
              timestamp: new Date(),
              messageType: "text",
            });

            await message.save();

            // Populate sender info
            await message.populate("senderId", "fullName username profilepic");

            const messageData = {
              message: {
                _id: message._id,
                content: message.content, // Encrypted
                senderId: message.senderId._id,
                receiverId: message.receiverId,
                senderInfo: {
                  fullName: message.senderId.fullName,
                  username: message.senderId.username,
                  profilepic: message.senderId.profilepic,
                },
                timestamp: message.timestamp.toISOString(),
                messageType: message.messageType,
              },
              senderId,
              receiverId,
              timestamp: message.timestamp,
              chatId,
            };

            // Send success callback to sender first
            if (callback) {
              callback({
                success: true,
                message: messageData.message,
                tempId,
              });
            }

            // Send to other users in the chat room (exclude sender)
            socket.to(chatId).emit("newMessage", messageData);

            // Also send to receiver if they're not in the chat room (for notifications)
            const receiverSocketId = this.onlineUsers.get(receiverId);
            if (receiverSocketId && receiverSocketId !== socket.id) {
              this.io.to(receiverSocketId).emit("new_message", {
                senderId,
                chatId,
                timestamp: message.timestamp,
                content: message.content,
              });
            }

            console.log(
              `Message sent from ${senderId} to ${receiverId} in chat ${chatId}`
            );
          } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = "Failed to send message";
            socket.emit("error", { message: errorMessage });
            if (callback) callback({ success: false, error: errorMessage });
          }
        }
      );

      // Handle deleting messages
      socket.on("deleteMessage", async ({ messageId, chatId }, callback) => {
        try {
          // Find the message
          const message = await Message.findById(messageId);

          if (!message) {
            return callback?.({ success: false, error: "Message not found" });
          }

          // Verify that the user is the sender of the message
          if (message.senderId.toString() !== socket.userId) {
            return callback?.({
              success: false,
              error: "You can only delete your own messages",
            });
          }

          // Verify the chat ID matches
          if (message.chatId !== chatId) {
            return callback?.({ success: false, error: "Chat ID mismatch" });
          }

          // Mark message as deleted instead of permanently deleting
          message.deleted = true;
          message.deletedAt = new Date();
          await message.save();

          const deleteData = {
            messageId,
            chatId,
            senderId: socket.userId,
            deletedAt: message.deletedAt,
          };

          // Send success callback to sender
          if (callback) {
            callback({ success: true, messageId });
          }

          // Broadcast deletion to all users in the chat room
          this.io.to(chatId).emit("messageDeleted", deleteData);

          // Also send to receiver if they're online
          const receiverSocketId = this.onlineUsers.get(
            message.receiverId.toString()
          );
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("messageDeleted", deleteData);
          }

          console.log(
            `Message ${messageId} deleted by user ${socket.userId} in chat ${chatId}`
          );
        } catch (error) {
          console.error("Error deleting message:", error);
          callback?.({ success: false, error: "Failed to delete message" });
        }
      });

      // Handle sending files
      socket.on(
        "sendFile",
        async (
          { chatId, content, fileName, fileData, receiverId, tempId },
          callback
        ) => {
          try {
            const senderId = socket.userId;

            if (!receiverId || !fileName || !fileData) {
              return callback?.({ success: false, error: "Invalid file data" });
            }

            // Validate file size
            const fileBuffer = Buffer.from(fileData);
            if (fileBuffer.length > this.MAX_FILE_SIZE) {
              return callback?.({
                success: false,
                error: `File size exceeds limit of ${
                  this.MAX_FILE_SIZE / (1024 * 1024)
                }MB`,
              });
            }

            // Validate file type (optional - you can enable this if needed)
            // const fileExtension = fileName.split('.').pop().toLowerCase();
            // if (!this.ALLOWED_FILE_TYPES.some(type => type.includes(fileExtension))) {
            //   return callback?.({ success: false, error: "File type not allowed" });
            // }

            // Verify receiver exists
            const receiver = await User.findById(receiverId);
            if (!receiver) {
              return callback?.({
                success: false,
                error: "Receiver not found",
              });
            }

            // Save message with file
            const message = new Message({
              chatId,
              senderId,
              receiverId,
              content: content || `[File: ${fileName}]`,
              messageType: "file",
              fileName,
              fileData: fileBuffer,
              timestamp: new Date(),
            });

            await message.save();
            await message.populate("senderId", "fullName username profilepic");

            // Create file URL for immediate use
            const fileUrl = this.getFileUrl(fileBuffer, fileName);

            const messageData = {
              _id: message._id,
              senderId,
              receiverId,
              content: message.content,
              messageType: "file",
              fileName,
              fileUrl, // Include the file URL
              fileSize: fileBuffer.length,
              senderInfo: {
                fullName: message.senderId.fullName,
                username: message.senderId.username,
                profilepic: message.senderId.profilepic,
              },
              timestamp: message.timestamp,
            };

            // Send success callback to sender
            if (callback) {
              callback({
                success: true,
                message: messageData,
                tempId,
              });
            }

            // Broadcast to other users in chat
            socket.to(chatId).emit("newMessage", {
              message: messageData,
              chatId,
              senderId,
              receiverId,
              timestamp: message.timestamp,
            });

            // Send to receiver if they're online but not in chat room
            const receiverSocketId = this.onlineUsers.get(receiverId);
            if (receiverSocketId && receiverSocketId !== socket.id) {
              this.io.to(receiverSocketId).emit("new_message", {
                senderId,
                chatId,
                timestamp: message.timestamp,
                content: `[File: ${fileName}]`,
              });
            }

            console.log(
              `File sent: ${fileName} (${fileBuffer.length} bytes) from ${senderId} to ${receiverId}`
            );
          } catch (error) {
            console.error("sendFile error:", error);
            callback?.({ success: false, error: "Failed to send file" });
          }
        }
      );

      // Handle typing indicators
      socket.on("typing", ({ chatId, userId, isTyping }) => {
        if (userId !== socket.userId) return;

        if (!this.typingUsers.has(chatId)) {
          this.typingUsers.set(chatId, new Set());
        }

        const typingInChat = this.typingUsers.get(chatId);

        if (isTyping) {
          typingInChat.add(userId);
        } else {
          typingInChat.delete(userId);
        }

        // Broadcast to others in the chat
        socket.to(chatId).emit("userTyping", { userId, chatId, isTyping });
      });

      // Handle marking messages as read
      socket.on("markAsRead", async ({ chatId, userId }) => {
        try {
          if (userId !== socket.userId) return;

          // Update messages as read in database
          const result = await Message.updateMany(
            {
              chatId,
              senderId: { $ne: userId },
              read: false,
              deleted: { $ne: true }, // Don't mark deleted messages as read
            },
            {
              read: true,
              readAt: new Date(),
            }
          );

          // Notify other users in the chat
          socket.to(chatId).emit("messageRead", {
            chatId,
            userId,
            count: result.modifiedCount,
          });

          console.log(
            `${result.modifiedCount} messages marked as read for user ${userId} in chat ${chatId}`
          );
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      // Handle getting unread counts
      socket.on("getUnreadCounts", async (callback) => {
        try {
          const unreadCounts = {};

          // Get all chats for this user
          const messages = await Message.aggregate([
            {
              $match: {
                $or: [
                  { senderId: socket.userId },
                  { receiverId: socket.userId },
                ],
                deleted: { $ne: true }, // Exclude deleted messages
              },
            },
            {
              $group: {
                _id: "$chatId",
                unreadCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$senderId", socket.userId] },
                          { $eq: ["$read", false] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]);

          // Convert to friendId -> unreadCount format
          for (const item of messages) {
            const [userId1, userId2] = item._id.split("-");
            const friendId = userId1 === socket.userId ? userId2 : userId1;
            unreadCounts[friendId] = item.unreadCount;
          }

          callback({ success: true, unreadCounts });
        } catch (error) {
          console.error("Error getting unread counts:", error);
          callback({ success: false, error: "Failed to get unread counts" });
        }
      });

      // Handle leaving chat room
      socket.on("leaveChat", ({ chatId }) => {
        socket.leave(chatId);
        console.log(`User ${socket.userId} left chat ${chatId}`);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);

        // Remove from online users
        this.onlineUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);

        // Remove from typing indicators
        for (const [chatId, typingUsers] of this.typingUsers.entries()) {
          if (typingUsers.has(socket.userId)) {
            typingUsers.delete(socket.userId);
            // Notify others that user stopped typing
            socket.to(chatId).emit("userTyping", {
              userId: socket.userId,
              chatId,
              isTyping: false,
            });
          }
        }

        // Broadcast updated online users list
        this.broadcastOnlineUsers();
      });
    });
  }

  // Helper methods
  broadcastOnlineUsers() {
    const onlineUserIds = Array.from(this.onlineUsers.keys());
    this.io.emit("onlineUsers", onlineUserIds);
    console.log(`Online users: ${onlineUserIds.length}`);
  }

  // Method to send message to specific user (for notifications, etc.)
  sendToUser(userId, event, data) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Method to get online status
  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  // Method to get connection count
  getConnectionCount() {
    return this.onlineUsers.size;
  }

  // Method to broadcast to all users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Method to send to specific chat room
  sendToChatRoom(chatId, event, data) {
    this.io.to(chatId).emit(event, data);
  }
}

export default SocketService;
