// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import useAuthUser from "../../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getUserFriends } from "../../lib/api";
import { useLocation } from "react-router";

// Import our new components and utils
import { encryptMessage, decryptMessage } from "../../lib/chatUtils";
import {
  UserListSidebar,
  ChatHeader,
  MessageBubble,
  TypingIndicator,
  MessageInput,
  WelcomeScreen,
} from "../../components/Chat";

const HomePage = () => {
  const location = useLocation();
  const { userId: targetUserId } = location.state || {};

  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();

  // State management
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeouts = useRef({});

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
  });

  // Auto-select user when navigating from another page
  useEffect(() => {
    if (targetUserId && users.length > 0 && !selectedUser) {
      const targetUser = users.find((user) => user._id === targetUserId);
      if (targetUser) {
        setSelectedUser(targetUser);
        setShowSidebar(false); // Hide sidebar on mobile when chat is selected
      }
    }
  }, [targetUserId, users, selectedUser]);

  // Utility functions
  const getCurrentChatId = () => {
    if (!authUser || !selectedUser) return null;
    return [authUser._id, selectedUser._id].sort().join("-");
  };

  // Socket setup
  useEffect(() => {
    if (!authUser) return;

    const newSocket = io(
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
      {
        transports: ["websocket", "polling"],
        withCredentials: true,
      }
    );

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("disconnect", () => console.log("Socket disconnected"));

    // Online users
    newSocket.on("onlineUsers", (ids) => setOnlineUsers(new Set(ids)));

    // New messages
    newSocket.on("newMessage", (data) => {
      const { message, chatId } = data;
      if (!selectedUser || chatId !== getCurrentChatId()) return;
      if (message.senderId === authUser._id) return;

      const otherUserId = message.senderId;
      const decryptedContent = decryptMessage(
        message.content,
        authUser._id,
        otherUserId
      );

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [
          ...prev,
          {
            ...message,
            content: decryptedContent,
            timestamp: new Date(message.timestamp),
          },
        ];
      });
    });

    // Typing indicator
    newSocket.on("userTyping", ({ userId, chatId, isTyping }) => {
      if (
        !selectedUser ||
        chatId !== getCurrentChatId() ||
        userId === authUser._id
      )
        return;

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);
    return () => {
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      newSocket.disconnect();
    };
  }, [authUser, selectedUser]);

  // Join chat & load messages
  useEffect(() => {
    if (!socket || !selectedUser) {
      setMessages([]);
      return;
    }

    const chatId = getCurrentChatId();
    setMessagesLoading(true);

    socket.emit("joinChat", { chatId, userId: authUser._id });

    socket.emit("loadMessages", { chatId }, (res) => {
      if (res.success) {
        setMessages(
          res.messages.map((msg) => ({
            ...msg,
            content: decryptMessage(
              msg.content,
              authUser._id,
              selectedUser._id
            ),
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }))
        );
      }
      setMessagesLoading(false);
    });

    socket.emit("markAsRead", { chatId, userId: authUser._id });
  }, [socket, selectedUser]);

  // Auto scroll messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Event handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const chatId = getCurrentChatId();
    const encryptedContent = encryptMessage(
      newMessage.trim(),
      authUser._id,
      selectedUser._id
    );

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage = {
      _id: tempId,
      content: newMessage.trim(),
      senderId: authUser._id,
      receiverId: selectedUser._id,
      timestamp: new Date(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit(
      "sendMessage",
      {
        chatId,
        content: encryptedContent,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        tempId,
      },
      (response) => {
        if (response?.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId
                ? {
                    ...response.message,
                    content: newMessage.trim(),
                    timestamp: new Date(response.message.timestamp),
                  }
                : msg
            )
          );
        } else {
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        }
      }
    );

    setNewMessage("");
    socket.emit("typing", { chatId, userId: authUser._id, isTyping: false });
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    if (!socket || !selectedUser) return;

    const chatId = getCurrentChatId();
    socket.emit("typing", { chatId, userId: authUser._id, isTyping: true });

    if (typingTimeouts.current.self) clearTimeout(typingTimeouts.current.self);
    typingTimeouts.current.self = setTimeout(() => {
      socket.emit("typing", { chatId, userId: authUser._id, isTyping: false });
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowSidebar(false); // Hide sidebar on mobile when user is selected
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedUser(null);
  };

  if (!authUser) {
    return (
      <div className="flex h-screen bg-base-200 items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    // In HomePage.jsx, change the main container:
    <div
      className="flex h-screen bg-gradient-to-br from-base-200 via-base-200 to-base-300/50 overflow-hidden"
      data-theme={theme}
    >
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div
        className={`${showSidebar ? "flex" : "hidden lg:flex"} flex-shrink-0`}
      >
        <UserListSidebar
          users={users}
          selectedUser={selectedUser}
          onlineUsers={onlineUsers}
          onUserSelect={handleUserSelect}
          isLoading={usersLoading}
          theme={theme}
        />
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          !showSidebar || selectedUser ? "flex" : "hidden lg:flex"
        } min-h-0`} // ✅ important for flex scroll
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0">
              <ChatHeader
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                typingUsers={typingUsers}
                onBack={handleBackToSidebar}
              />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 py-1 bg-gradient-to-b from-base-100/50 to-base-100/30 backdrop-blur-sm">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <p className="text-xs text-base-content/70 mt-2">
                      Loading messages...
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm mx-auto p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">👋</span>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      No messages yet with{" "}
                      {selectedUser.fullName || selectedUser.username}
                    </p>
                    <p className="text-xs text-base-content/50">
                      Send a message to start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 flex flex-col justify-end min-h-full">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      message={msg}
                      isOwn={msg.senderId === authUser._id}
                      authUser={authUser}
                    />
                  ))}

                  {/* Typing indicator */}
                  {typingUsers.has(selectedUser._id) && (
                    <TypingIndicator user={selectedUser} />
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 border-t border-base-300 bg-base-100">
              <MessageInput
                newMessage={newMessage}
                onMessageChange={handleTyping}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={messagesLoading}
              />
            </div>
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default HomePage; // src/pages/HomePage.jsx
