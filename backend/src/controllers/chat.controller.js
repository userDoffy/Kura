import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const getChatId = (u1, u2) => [u1.toString(), u2.toString()].sort().join("-");

export const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's friends
    const user = await User.findById(userId).populate(
      "friends",
      "username fullName profilepic"
    );
    const friends = user.friends || [];

    if (friends.length === 0) return res.json([]);

    // Build final chat list with unread counts
    const chatList = await Promise.all(
      friends.map(async (friend) => {
        const chatId = getChatId(userId, friend._id);

        // Only get unread count
        const unreadCount = await Message.countDocuments({
          chatId,
          receiverId: userId,
          read: false,
        });

        return {
          chatId,
          user: {
            _id: friend._id,
            username: friend.username,
            fullName: friend.fullName,
            profilepic: friend.profilepic || "/default-avatar.png",
          },
          unreadCount, // only unread messages
        };
      })
    );

    // Optional: sort by unread count descending
    chatList.sort((a, b) => b.unreadCount - a.unreadCount);

    res.json(chatList);
  } catch (error) {
    console.error("getChatList error:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};
