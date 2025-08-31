import React from "react";
import { Link } from "react-router";
import { useThemeStore } from "../store/useThemeStore";
import { User, MessageCircle, UserPlus, Check, X, UserMinus } from "lucide-react";

const FriendCard = ({ user, onAdd, onAccept, onDecline, onRemove, pending }) => {
  const { theme } = useThemeStore();

  return (
    <div
      className="group bg-base-100 hover:bg-base-200 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl p-4 border border-base-300 hover:border-primary/20"
      data-theme={theme}
    >
      {/* Avatar with status indicator */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-base-300 group-hover:ring-primary/30 transition-all duration-300">
            {user.profilepic ? (
              <img
                src={user.profilepic}
                alt={user.username || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-base-300 flex items-center justify-center">
                <User className="w-8 h-8 text-base-content/40" />
              </div>
            )}
          </div>
          {/* Online status dot - could be conditional based on user status */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-3 border-base-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Username */}
        <h3 className="font-semibold text-base-content mt-3 text-center group-hover:text-primary transition-colors duration-200">
          {user.username || "Unknown User"}
        </h3>
        
        {/* Optional: Add mutual friends or other info */}
        {user.mutualFriends && (
          <span className="text-xs text-base-content/60 mt-1">
            {user.mutualFriends} mutual friends
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Add Friend Button */}
        {onAdd && !pending && (
          <button
            onClick={onAdd}
            className="btn btn-sm btn-primary w-full gap-2 hover:scale-105 transition-transform duration-200"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        )}

        {/* Pending State */}
        {pending && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-warning/10 text-warning rounded-lg text-sm font-medium">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
            Request Sent
          </div>
        )}

        {/* Accept/Decline Buttons - Fixed layout */}
        {onAccept && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAccept}
              className="btn btn-sm btn-success gap-1 hover:scale-105 transition-transform duration-200 min-h-8 h-8 px-2 text-xs"
            >
              <Check className="w-3 h-3" />
              Accept
            </button>
            {onDecline && (
              <button
                onClick={onDecline}
                className="btn btn-sm btn-error btn-outline gap-1 hover:scale-105 transition-transform duration-200 min-h-8 h-8 px-2 text-xs"
              >
                <X className="w-3 h-3" />
                Decline
              </button>
            )}
          </div>
        )}

        {/* Friend Actions (Message & Remove) */}
        {onRemove && (
          <div className="space-y-2">
            <Link
              to={`/chat`}
              state={{ userId: user._id }}
              className="btn btn-sm btn-primary w-full gap-2 hover:scale-105 transition-transform duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
            <button
              onClick={onRemove}
              className="btn btn-sm btn-ghost text-error hover:bg-error/10 w-full gap-2 transition-all duration-200"
            >
              <UserMinus className="w-4 h-4" />
              Remove Friend
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendCard;