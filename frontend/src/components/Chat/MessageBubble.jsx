// components/Chat/MessageBubble.jsx
import React from "react";
import { Check, CheckCheck, Clock, Download, File, Image } from "lucide-react";
import { formatTime } from "../../lib/chatUtils";

const MessageBubble = ({ message, isOwn }) => {
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to check if file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(ext);
  };

  // Helper function to get file icon
  const getFileIcon = (fileName) => {
    if (isImageFile(fileName)) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  // Handle file download
  const handleFileDownload = (e) => {
    e.preventDefault();
    if (message.fileUrl && message.fileName) {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
          {message.messageType === "file" ? (
            <div className="space-y-2">
              {/* File info section */}
              <div className="flex items-center gap-2">
                {getFileIcon(message.fileName)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {message.fileName}
                  </div>
                  {message.fileSize && (
                    <div className="text-xs opacity-70">
                      {formatFileSize(message.fileSize)}
                    </div>
                  )}
                </div>
                {message.fileUrl && !message.isOptimistic && (
                  <button
                    onClick={handleFileDownload}
                    className={`btn btn-ghost btn-xs btn-circle ${
                      isOwn ? "hover:bg-primary-content/20" : "hover:bg-base-300"
                    }`}
                    title="Download file"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Image preview for image files */}
              {message.fileUrl && isImageFile(message.fileName) && (
                <div className="max-w-64">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleFileDownload}
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.style.display = 'none';
                    }}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Loading indicator for optimistic messages */}
              {message.isOptimistic && (
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <div className="loading loading-spinner loading-xs"></div>
                  <span>Uploading...</span>
                </div>
              )}

              {/* Additional text content if any */}
              {message.content && message.content !== `[File: ${message.fileName}]` && (
                <p className="text-sm break-words whitespace-pre-wrap leading-relaxed mt-2 pt-2 border-t border-current/20">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <p className="break-words whitespace-pre-wrap leading-relaxed text-sm">
              {message.content}
            </p>
          )}
        </div>
        
        {/* Message metadata */}
        <div
          className={`flex items-center gap-1 mt-0.5 px-2 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
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