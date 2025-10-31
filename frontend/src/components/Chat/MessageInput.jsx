import React, { useRef, useState } from "react";
import { Send, Paperclip, X, AlertCircle } from "lucide-react";

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onSendFile,
  disabled,
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate file before sending
  const validateFile = (file) => {
    setFileError("");

    if (!file) {
      setFileError("No file selected");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file) && onSendFile) {
      onSendFile(file);
    }
    e.target.value = ""; // reset input
  };

  const handleAttachClick = () => {
    setFileError(""); // Clear any previous errors
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // Only handle the first file
      if (validateFile(file) && onSendFile) {
        onSendFile(file);
      }
    }
  };

  const clearError = () => {
    setFileError("");
  };

  return (
    <div className="relative">
      {/* File error notification */}
      {fileError && (
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-error/10 border-l-4 border-error flex items-center gap-2 text-error text-xs">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="flex-1">{fileError}</span>
          <button
            onClick={clearError}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main input area */}
      <div
        className={`p-2 sm:p-3 bg-base-100 flex items-center gap-1.5 sm:gap-2 transition-all ${
          dragOver
            ? "bg-primary/10 border-t-2 border-primary/50"
            : "border-t border-base-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-center p-4">
              <Paperclip className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-primary" />
              <p className="text-xs sm:text-sm font-medium text-primary">
                Drop file to upload
              </p>
              <p className="text-[10px] sm:text-xs text-primary/70 mt-1">
                Max: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </div>
        )}

        {/* Attach button */}
        <button
          type="button"
          className="btn btn-ghost btn-xs sm:btn-sm btn-circle flex-shrink-0"
          onClick={handleAttachClick}
          title={`Attach file (Max: ${formatFileSize(MAX_FILE_SIZE)})`}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* File input */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
        />

        {/* Message input */}
        <textarea
          placeholder="Type a message..."
          className="textarea textarea-sm flex-1 bg-base-200 border-none resize-none text-sm leading-tight max-h-36 overflow-y-auto p-2 rounded-md sm:max-h-48"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          className={`btn btn-xs sm:btn-sm btn-circle transition-all flex-shrink-0 ${
            newMessage.trim()
              ? "btn-primary shadow-lg hover:scale-105"
              : "btn-ghost"
          }`}
          onClick={onSendMessage}
          disabled={disabled || !newMessage.trim()}
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
