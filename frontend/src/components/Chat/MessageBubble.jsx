// components/Chat/MessageBubble.jsx
import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { formatTime } from "../../lib/chatUtils";
const MessageBubble = ({ message, isOwn, authUser }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`group max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-3 py-2 shadow-sm ${
            isOwn
              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-content ml-auto"
              : "bg-base-200/80 backdrop-blur-sm text-base-content"
          } ${message.isOptimistic ? "opacity-70" : ""}`}
        >
          <p className="break-words whitespace-pre-wrap leading-relaxed text-sm">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center gap-1 mt-0.5 px-2 ${
          isOwn ? "justify-end" : "justify-start"
        }`}>
          <span className="text-xs text-base-content/60">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <div className="text-base-content/60">
              {message.isOptimistic ? (
                <Clock className="w-3 h-3" />
              ) : message.isRead ? (
                <CheckCheck className="w-3 h-3 text-primary" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;