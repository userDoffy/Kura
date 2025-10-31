import React, { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { getChatList } from "../../lib/api";
import { io } from "socket.io-client";
import { BiSolidMessageRoundedDots } from "react-icons/bi";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
  autoConnect: true,
});

const UserListSidebar = ({ selectedUser, onlineUsers, onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch initial chat list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const chatList = await getChatList();
        const formatted = chatList.map((chat) => ({
          _id: chat.user._id,
          fullName: chat.user.fullName,
          username: chat.user.username,
          profilepic: chat.user.profilepic,
          lastMessageTime: chat.lastMessage?.timestamp || null,
          unreadCount: chat.unreadCount || 0,
        }));
        setUsers(formatted);
      } catch (err) {
        console.error("Error fetching chat list:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, []);

  // Socket listener for new messages
  useEffect(() => {
    socket.on("new_message", (message) => {
      setUsers((prevUsers) => {
        const userIndex = prevUsers.findIndex(
          (u) => u._id === message.senderId
        );
        if (userIndex > -1) {
          const updated = [...prevUsers];
          updated[userIndex] = {
            ...updated[userIndex],
            lastMessageTime: message.timestamp,
            unreadCount: updated[userIndex].unreadCount + 1,
          };
          return updated;
        } else {
          // Optionally: add new user if sender not in list
          return prevUsers;
        }
      });
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  // Filter and sort users
  const filteredUsers = users.filter((user) =>
    (user.fullName || user.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
  });

  return (
    <div className="w-full h-full bg-base-100 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-2 sm:p-3 border-b border-base-300">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm sm:text-base flex-1">Messages</h2>
          <div className="badge badge-primary badge-xs">{users.length}</div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search..."
            className="input input-xs sm:input-sm w-full pl-7 sm:pl-8 bg-base-200 border-none text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-3">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <p className="text-xs sm:text-sm text-base-content/70">
                Loading conversations...
              </p>
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="p-3 bg-base-200/50 rounded-full w-fit mx-auto">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-base-content/30" />
              </div>
              <p className="text-sm font-medium text-base-content/80">
                {searchTerm ? "No matches found" : "No conversations yet"}
              </p>
              <p className="text-xs text-base-content/60 mt-1">
                {searchTerm
                  ? "Try a different search term"
                  : "Start chatting with your friends"}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-1 sm:p-1.5 space-y-0.5 sm:space-y-1">
            {sortedUsers.map((user) => {
              const isOnline = onlineUsers.has(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  className={`p-2 sm:p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-primary text-primary-content shadow"
                      : "bg-base-200/50 hover:bg-base-200 active:scale-[0.98]"
                  }`}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.profilepic || "/default-avatar.png"}
                        alt={user.username}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                          isSelected ? "border-primary" : "border-base-100"
                        } ${isOnline ? "bg-success" : "bg-base-content/30"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs sm:text-sm">
                        {user.fullName || user.username}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs truncate ${
                          isSelected
                            ? "text-primary-content/80"
                            : "text-base-content/60"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  {/* Unread icon with count */}
                  <div className="relative flex-shrink-0">
                    <BiSolidMessageRoundedDots
                      className={`w-5 h-5 ${
                        user.unreadCount > 0 ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                    {user.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListSidebar;
