// components/Chat/MessageInput.jsx
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
  const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed'
  ];

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file before sending
  const validateFile = (file) => {
    setFileError("");

    if (!file) {
      setFileError("No file selected");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    // Optional: Uncomment to enable file type validation
    // if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    //   setFileError(`File type ${file.type} is not allowed`);
    //   return false;
    // }

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

  const handleKeyDown = (e) => {
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 72); // Max 3 lines
    textarea.style.height = newHeight + 'px';

    // Handle enter key
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  const clearError = () => {
    setFileError("");
  };

  return (
    <div className="relative">
      {/* File error notification */}
      {fileError && (
        <div className="px-2 py-1 bg-error/10 border-l-4 border-error flex items-center gap-2 text-error text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
        className={`p-2 bg-base-300/30 backdrop-blur-sm border-t border-base-content/10 flex-shrink-0 flex items-end gap-2 transition-all duration-200 ${
          dragOver ? 'bg-primary/10 border-primary/50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-primary font-medium">Drop file to upload</p>
              <p className="text-xs text-primary/70">Max size: {formatFileSize(MAX_FILE_SIZE)}</p>
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            className="textarea textarea-bordered w-full resize-none bg-base-100/50 backdrop-blur-sm focus:bg-base-100 transition-colors text-sm leading-tight"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ 
              minHeight: "2.25rem", 
              maxHeight: "4.5rem",
              overflowY: newMessage.split('\n').length > 2 ? 'auto' : 'hidden'
            }}
            disabled={disabled}
          />
        </div>

        {/* File input */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
        />

        {/* Attach button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors"
          onClick={handleAttachClick}
          title={`Attach file (Max: ${formatFileSize(MAX_FILE_SIZE)})`}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          className={`btn btn-sm btn-circle transition-all duration-200 ${
            newMessage.trim()
              ? "btn-primary shadow-lg shadow-primary/25 hover:shadow-primary/40"
              : "btn-ghost hover:bg-base-200"
          }`}
          onClick={onSendMessage}
          disabled={disabled || !newMessage.trim()}
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* File upload tips */}
      <div className="px-2 py-1">
        <div className="text-xs text-base-content/50">
          Tip: You can drag and drop files or click the paperclip to attach files up to {formatFileSize(MAX_FILE_SIZE)}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;