// components/Chat/MessageInput.jsx
import React from "react";
import { Send } from "lucide-react";
const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  disabled,
}) => {
  return (
    // In MessageInput component, add fixed positioning context:
    <div className="p-2 bg-base-300/30 backdrop-blur-sm border-t border-base-content/10 flex-shrink-0">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className="textarea textarea-bordered w-full resize-none bg-base-100/50 backdrop-blur-sm focus:bg-base-100 transition-colors text-sm leading-tight"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            rows={1}
            style={{ minHeight: "2.25rem", maxHeight: "4.5rem" }}
          />
        </div>

        <button
          className={`btn btn-sm btn-circle ${
            newMessage.trim()
              ? "btn-primary shadow-lg shadow-primary/25"
              : "btn-ghost"
          }`}
          onClick={onSendMessage}
          disabled={disabled || !newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default MessageInput;
