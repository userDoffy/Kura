import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper: create consistent chatId (sorted sender/receiver IDs)
// ⚠️ IMPORTANT: This must match the chatId generation in Socket.IO service
const getChatId = (u1, u2) => {
  return [u1.toString(), u2.toString()].sort().join("-"); // Changed from "_" to "-" to match Socket.IO
};

// @desc   Get messages with a user
// @route  GET /api/chat/:receiverId
// @access Private
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const chatId = getChatId(req.user._id, receiverId);

    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 }) // Changed from createdAt to timestamp to match Socket.IO model
      .populate("senderId", "username fullName profilepic") // Added fullName
      .populate("receiverId", "username fullName profilepic");

    if (messages.length === 0) {
      const receiver = await User.findById(receiverId).select(
        "username fullName profilepic"
      );
      return res.json({ messages: [], receiver });
    }

    // Format messages to match Socket.IO format
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content, // This will be encrypted content
      senderId: msg.senderId._id,
      receiverId: msg.receiverId._id,
      timestamp: msg.timestamp,
      read: msg.read,
      messageType: msg.messageType,
      senderInfo: {
        username: msg.senderId.username,
        fullName: msg.senderId.fullName,
        profilepic: msg.senderId.profilepic
      },
      receiverInfo: {
        username: msg.receiverId.username,
        fullName: msg.receiverId.fullName,
        profilepic: msg.receiverId.profilepic
      }
    }));

    res.json({ messages: formattedMessages, receiver: null });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// @desc   Send a message (HTTP fallback - Socket.IO is preferred)
// @route  POST /api/chat/send
// @access Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver and content required" });
    }

    const chatId = getChatId(req.user._id, receiverId);

    const message = await Message.create({
      chatId,
      content, // This should be encrypted content from client
      senderId: req.user._id,
      receiverId,
      messageType: messageType || "text",
      timestamp: new Date() // Add timestamp to match Socket.IO model
    });

    const populatedMessage = await message.populate([
      { path: "senderId", select: "username fullName profilepic" },
      { path: "receiverId", select: "username fullName profilepic" },
    ]);

    // Format response to match Socket.IO format
    const formattedMessage = {
      _id: populatedMessage._id,
      content: populatedMessage.content,
      senderId: populatedMessage.senderId._id,
      receiverId: populatedMessage.receiverId._id,
      timestamp: populatedMessage.timestamp,
      read: populatedMessage.read,
      messageType: populatedMessage.messageType,
      senderInfo: {
        username: populatedMessage.senderId.username,
        fullName: populatedMessage.senderId.fullName,
        profilepic: populatedMessage.senderId.profilepic
      }
    };

    // If Socket.IO service is available, broadcast the message
    const socketService = req.app.get('socketService');
    if (socketService) {
      socketService.io.to(chatId).emit('newMessage', {
        message: formattedMessage,
        senderId: req.user._id,
        receiverId,
        timestamp: populatedMessage.timestamp,
        chatId
      });
    }

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// @desc   Mark messages in chat as read
// @route  PATCH /api/chat/read/:chatId
// @access Private
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await Message.updateMany(
      { 
        chatId, 
        receiverId: req.user._id, 
        read: false 
      },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    // Notify through Socket.IO if available
    const socketService = req.app.get('socketService');
    if (socketService) {
      socketService.io.to(chatId).emit('messageRead', { 
        chatId, 
        userId: req.user._id 
      });
    }

    res.json({ 
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ message: "Error updating read status" });
  }
};

// @desc   Get chat list with last message per conversation  
// @route  GET /api/chat
// @access Private
export const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's friends instead of all users
    const user = await User.findById(userId).populate('friends', 'username fullName profilepic');
    const friends = user.friends || [];

    if (friends.length === 0) {
      return res.json([]);
    }

    // Fetch last messages per chat
    const chats = await Message.aggregate([
      { 
        $match: { 
          $or: [
            { senderId: userId }, 
            { receiverId: userId }
          ] 
        } 
      },
      { $sort: { timestamp: -1 } }, // Changed from createdAt to timestamp
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Map messages by chatId for quick lookup
    const chatMap = {};
    chats.forEach((c) => {
      chatMap[c._id] = c.lastMessage;
    });

    // Build final chat list (only friends, even if no messages yet)
    const chatList = await Promise.all(
      friends.map(async (friend) => {
        const chatId = getChatId(userId, friend._id);
        const lastMsg = chatMap[chatId]
          ? await Message.findById(chatMap[chatId]._id)
              .populate("senderId", "username fullName profilepic")
              .populate("receiverId", "username fullName profilepic")
          : null;

        // Get unread count for this chat
        const unreadCount = await Message.countDocuments({
          chatId,
          receiverId: userId,
          read: false
        });

        return {
          chatId,
          user: {
            _id: friend._id,
            username: friend.username,
            fullName: friend.fullName,
            profilepic: friend.profilepic
          },
          lastMessage: lastMsg ? {
            _id: lastMsg._id,
            content: lastMsg.content, // Encrypted content
            senderId: lastMsg.senderId._id,
            timestamp: lastMsg.timestamp,
            messageType: lastMsg.messageType
          } : null,
          unreadCount
        };
      })
    );

    // Sort by last message timestamp (most recent first)
    chatList.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
      return bTime - aTime;
    });

    res.json(chatList);
  } catch (error) {
    console.error("getChatList error:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};

// @desc   Delete a message
// @route  DELETE /api/chat/message/:messageId
// @access Private
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // Notify through Socket.IO if available
    const socketService = req.app.get('socketService');
    if (socketService) {
      socketService.io.to(message.chatId).emit('messageDeleted', { 
        messageId,
        chatId: message.chatId
      });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ message: "Error deleting message" });
  }
};

// @desc   Get unread message counts for all chats
// @route  GET /api/chat/unread-counts
// @access Private
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          read: false
        }
      },
      {
        $group: {
          _id: "$chatId",
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    // Convert to friendId -> unreadCount format
    const counts = {};
    for (const item of unreadCounts) {
      const [userId1, userId2] = item._id.split('-');
      const friendId = userId1 === userId.toString() ? userId2 : userId1;
      counts[friendId] = item.unreadCount;
    }

    res.json(counts);
  } catch (error) {
    console.error("getUnreadCounts error:", error);
    res.status(500).json({ message: "Error fetching unread counts" });
  }
};