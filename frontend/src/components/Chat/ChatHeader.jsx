import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

const ChatHeader = ({ selectedUser, onlineUsers, typingUsers, onBack }) => {
  const isOnline = onlineUsers.has(selectedUser._id);
  const isTyping = typingUsers.has(selectedUser._id);

  return (
    <div className="p-2 sm:p-3 bg-base-200 border-b border-base-300 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {/* Back button - visible on mobile */}
        <button 
          onClick={onBack}
          className="btn btn-ghost btn-xs sm:btn-sm btn-circle lg:hidden flex-shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        {/* User avatar with status */}
        <div className="relative flex-shrink-0">
          <img
            src={selectedUser.profilepic || "/default-avatar.png"}
            alt={selectedUser.username}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-base-200 ${
              isOnline ? "bg-success" : "bg-base-content/30"
            }`}
          />
        </div>
        
        {/* User info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm sm:text-base truncate">
            {selectedUser.fullName || selectedUser.username}
          </h2>
          <p className="text-[10px] sm:text-xs text-base-content/70 truncate">
            {isTyping ? (
              <span className="text-primary font-medium flex items-center gap-1">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                <span>Typing</span>
              </span>
            ) : isOnline ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full"></span>
                Active now
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-base-content/30 rounded-full"></span>
                Offline
              </span>
            )}
          </p>
        </div>

        {/* More options button */}
        <button 
          className="btn btn-ghost btn-xs sm:btn-sm btn-circle flex-shrink-0"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;