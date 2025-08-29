import React from "react";

const TypingIndicator = ({ user }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-base-200/80 backdrop-blur-sm text-base-content rounded-2xl px-4 py-3 max-w-[70%]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-base-content/70">
            {user.fullName || user.username} is typing...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;