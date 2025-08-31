// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String, // Changed from ObjectId to String for easier chat ID generation
      required: true,
      index: true, // Add index for better query performance
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000, // Add content length limit
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // Index for unread message queries
    },
    readAt: {
      type: Date,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
      index: true,
    },
    // File-specific fields
    fileName: {
      type: String,
      maxLength: 255, // Limit filename length
    },
    fileData: {
      type: Buffer, // Store binary data
      validate: {
        validator: function (value) {
          // Only validate if this is a file message
          if (this.messageType === "file") {
            return (
              value && value.length > 0 && value.length <= 10 * 1024 * 1024
            ); // 10MB limit
          }
          return true;
        },
        message:
          "File data is required for file messages and must be less than 10MB",
      },
    },
    fileSize: {
      type: Number,
      min: 0,
      max: 10 * 1024 * 1024, // 10MB limit
    },
    // Deletion fields
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by time
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
messageSchema.index({ chatId: 1, timestamp: -1 }); // Most common query pattern
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ receiverId: 1, read: 1 }); // For unread message queries
messageSchema.index({ messageType: 1, timestamp: -1 }); // For filtering by message type
messageSchema.index({ deleted: 1 });

// Virtual for file URL (if you want to generate URLs dynamically)
messageSchema.virtual("fileUrl").get(function () {
  if (this.messageType === "file" && this.fileData && this.fileName) {
    // Get MIME type from file extension
    const ext = this.fileName.split(".").pop().toLowerCase();
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
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    const base64 = this.fileData.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
  return null;
});

// Pre-save middleware to set fileSize
messageSchema.pre("save", function (next) {
  if (this.messageType === "file" && this.fileData) {
    this.fileSize = this.fileData.length;
  }
  next();
});

// Static method to generate chat ID
messageSchema.statics.getChatId = function (user1, user2) {
  return [user1.toString(), user2.toString()].sort().join("-");
};

// Instance method to check if message is from sender
messageSchema.methods.isFromSender = function (userId) {
  return this.senderId.toString() === userId.toString();
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = async function (userId, chatId = null) {
  const query = {
    receiverId: userId,
    read: false,
  };

  if (chatId) {
    query.chatId = chatId;
  }

  return this.countDocuments(query);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function (chatId, userId) {
  return this.updateMany(
    {
      chatId,
      receiverId: userId,
      read: false,
    },
    {
      read: true,
      readAt: new Date(),
    }
  );
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
