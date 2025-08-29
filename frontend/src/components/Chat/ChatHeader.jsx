import React from "react";
import { ArrowLeft } from "lucide-react";

const ChatHeader = ({ selectedUser, onlineUsers, typingUsers, onBack }) => {
  const isOnline = onlineUsers.has(selectedUser._id);
  const isTyping = typingUsers.has(selectedUser._id);

  return (
    <div className="p-2 bg-base-300/30 backdrop-blur-sm border-b border-base-content/10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="btn btn-ghost btn-sm btn-circle lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="relative">
          <img
            src={selectedUser.profilepic || "/default-avatar.png"}
            alt={selectedUser.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-base-content/10"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-base-300 ${
              isOnline ? "bg-success" : "bg-base-content/30"
            }`}
          />
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-base">
            {selectedUser.fullName || selectedUser.username}
          </h2>
          <p className="text-xs text-base-content/70">
            {isTyping ? (
              <span className="text-primary font-medium">Typing...</span>
            ) : isOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;