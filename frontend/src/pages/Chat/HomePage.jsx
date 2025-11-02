// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import useAuthUser from "../../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getUserFriends } from "../../lib/api";
import { useLocation } from "react-router";

// Chat utilities and components
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

  // State
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeouts = useRef({});

  // Fetch friends
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
  });

  // Auto-select target user
  useEffect(() => {
    if (targetUserId && users.length > 0 && !selectedUser) {
      const targetUser = users.find((user) => user._id === targetUserId);
      if (targetUser) {
        setSelectedUser(targetUser);
        setShowSidebar(false);
      }
    }
  }, [targetUserId, users, selectedUser]);

  const getCurrentChatId = () =>
    authUser && selectedUser
      ? [authUser._id, selectedUser._id].sort().join("-")
      : null;

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Socket connection
  useEffect(() => {
    if (!authUser) return;

    const newSocket = io(
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
      { transports: ["websocket", "polling"], withCredentials: true }
    );

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("disconnect", () => console.log("Socket disconnected"));

    // Handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Online users
    newSocket.on("onlineUsers", (ids) => setOnlineUsers(new Set(ids)));

    // New messages
    newSocket.on("newMessage", ({ message, chatId }) => {
      if (!selectedUser || chatId !== getCurrentChatId()) return;
      if (message.senderId === authUser._id) return;

      let processedMessage = { ...message };

      // Handle different message types
      if (message.messageType === "text") {
        processedMessage.encryptedContent = message.content;
        processedMessage.content = decryptMessage(
          message.content,
          authUser._id,
          message.senderId
        );
      }
      // For file messages, content and fileUrl are already processed by server

      processedMessage.timestamp = new Date(message.timestamp);

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === message._id)) return prev;
        return [...prev, processedMessage];
      });
    });

    // Handle message deletion
    newSocket.on("messageDeleted", ({ messageId, chatId }) => {
      if (!selectedUser || chatId !== getCurrentChatId()) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, deleted: true, content: "This message was deleted" }
            : msg
        )
      );
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
        isTyping ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);
    return () => {
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      newSocket.disconnect();
    };
  }, [authUser, selectedUser]);

  // Join chat and load messages
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
          res.messages.map((msg) => {
            if (msg.messageType === "file") {
              // File messages already have fileUrl from server
              return {
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              };
            } else {
              // Decrypt text content
              return {
                ...msg,
                encryptedContent: msg.content,
                content: decryptMessage(
                  msg.content,
                  authUser._id,
                  selectedUser._id
                ),
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              };
            }
          })
        );
      } else {
        console.error("Failed to load messages:", res.error);
      }
      setMessagesLoading(false);
    });

    socket.emit("markAsRead", { chatId, userId: authUser._id });
  }, [socket, selectedUser]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Delete message handler
  const handleDeleteMessage = (messageId) => {
    return new Promise((resolve, reject) => {
      if (!socket || !selectedUser) {
        reject(new Error("Socket or selected user not available"));
        return;
      }

      const chatId = getCurrentChatId();

      socket.emit("deleteMessage", { messageId, chatId }, (response) => {
        if (response?.success) {
          // Update local state to mark message as deleted
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId
                ? { ...msg, deleted: true, content: "This message was deleted" }
                : msg
            )
          );
          resolve();
        } else {
          console.error("Failed to delete message:", response?.error);
          alert(response?.error || "Failed to delete message");
          reject(new Error(response?.error || "Failed to delete message"));
        }
      });
    });
  };

  // Send text message
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
      encryptedContent: encryptedContent,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      timestamp: new Date(),
      isOptimistic: true,
      messageType: "text",
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
                    encryptedContent: encryptedContent,
                    timestamp: new Date(response.message.timestamp),
                  }
                : msg
            )
          );
        } else {
          console.error("Failed to send message:", response?.error);
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        }
      }
    );

    setNewMessage("");
    socket.emit("typing", { chatId, userId: authUser._id, isTyping: false });
  };

  // Typing
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
    setShowSidebar(false);
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedUser(null);
  };

  // Send file with validation
  const handleSendFile = (file) => {
    if (!socket || !selectedUser) return;

    // Client-side file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`File size must be less than ${formatFileSize(maxSize)}`);
      return;
    }

    const chatId = getCurrentChatId();
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const tempId = `temp_file_${Date.now()}_${Math.random()}`;

      // Create optimistic message with Blob URL for immediate preview
      const optimisticMessage = {
        _id: tempId,
        content: `[File: ${file.name}]`,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // Use original file for optimistic display
        fileSize: file.size,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        timestamp: new Date(),
        isOptimistic: true,
        messageType: "file",
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit(
        "sendFile",
        {
          chatId,
          content: `[File: ${file.name}]`,
          fileName: file.name,
          fileData: arrayBuffer,
          receiverId: selectedUser._id,
          tempId,
        },
        (response) => {
          if (response?.success) {
            // Revoke the old blob URL to prevent memory leaks
            URL.revokeObjectURL(optimisticMessage.fileUrl);

            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId
                  ? {
                      ...response.message,
                      timestamp: new Date(response.message.timestamp),
                      isOptimistic: false,
                    }
                  : msg
              )
            );
          } else {
            console.error("Failed to send file:", response?.error);
            // Revoke blob URL on error too
            URL.revokeObjectURL(optimisticMessage.fileUrl);
            setMessages((prev) => prev.filter((msg) => msg._id !== tempId));

            // Show error message to user
            alert(response?.error || "Failed to send file. Please try again.");
          }
        }
      );
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    };

    reader.readAsArrayBuffer(file);
  };

  if (!authUser) {
    return (
      <div className="flex h-screen bg-base-200 items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const messagesContainerRef = useRef(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-base-200 via-base-200 to-base-300/50 "
      data-theme={theme}
    >
      {/* Sidebar - Fixed width on desktop, full screen on mobile */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-14 right-0 bottom-0 z-40 bg-base-100
  transition-transform duration-200 lg:static lg:translate-x-0 lg:w-80 border-r border-base-300`}
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

      {/* Chat area - Properly constrained */}
      <div
        className={`flex-1 flex flex-col min-h-0 ${
          !showSidebar || selectedUser ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Chat Header - Fixed at top */}
            <div className="flex-shrink-0">
              <ChatHeader
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                typingUsers={typingUsers}
                onBack={handleBackToSidebar}
              />
            </div>

            {/* Messages Area - Scrollable middle section */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4 bg-gradient-to-b from-base-100/50 to-base-100/30 backdrop-blur-sm scroll-smooth"
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <div className="space-y-2 flex flex-col justify-end min-h-full pb-2">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      message={msg}
                      isOwn={msg.senderId === authUser._id}
                      authUser={authUser}
                      onDeleteMessage={handleDeleteMessage}
                    />
                  ))}
                  {typingUsers.has(selectedUser._id) && (
                    <TypingIndicator user={selectedUser} />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input*/}
            <div className="border-t border-base-300 bg-base-100/95 backdrop-blur-sm flex-shrink-0">
              <MessageInput
                newMessage={newMessage}
                onMessageChange={handleTyping}
                onSendMessage={handleSendMessage}
                onSendFile={handleSendFile}
                onKeyPress={handleKeyPress}
                disabled={messagesLoading}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <WelcomeScreen />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
