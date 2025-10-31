// components/Chat/MessageBubble.jsx
import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  File,
  Image,
  Trash2,
  X,
} from "lucide-react";
import { formatTime } from "../../lib/chatUtils";

const MessageBubble = ({ message, isOwn, onDeleteMessage }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Check if file is image
  const isImageFile = (fileName) =>
    ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
      fileName?.split(".").pop()?.toLowerCase()
    );

  const getFileIcon = (fileName) =>
    isImageFile(fileName) ? <Image className="w-4 h-4" /> : <File className="w-4 h-4" />;

  // File download
  const handleFileDownload = () => {
    if (!message.fileUrl || !message.fileName) return;
    const link = document.createElement("a");
    link.href = message.fileUrl;
    link.download = message.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Delete message
  const handleConfirmDelete = async () => {
    if (!onDeleteMessage) return;
    setIsDeleting(true);
    try {
      await onDeleteMessage(message._id);
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Deleted message UI
  if (message.deleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
        <div className="max-w-[75%] bg-base-300/50 rounded-2xl px-3 py-2 text-base-content/50 italic text-sm break-words [overflow-wrap:anywhere]">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 group`}>
      {/* Delete button for own messages */}
      {isOwn && !message.isOptimistic && (
        <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/20"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="btn btn-ghost btn-xs btn-circle text-success hover:bg-success/20"
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:bg-base-300/50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-[75%] sm:max-w-[60%] break-words [overflow-wrap:anywhere] min-w-0">
        <div
          className={`rounded-2xl px-3 py-2 shadow-sm break-words min-w-0 ${
            isOwn
              ? "bg-primary text-primary-content"
              : "bg-base-200 text-base-content"
          } ${message.isOptimistic ? "opacity-70" : ""}`}
        >
          {/* File message */}
          {message.messageType === "file" ? (
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(message.fileName)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                    {message.fileName}
                  </p>
                  {message.fileSize && (
                    <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                  )}
                </div>

                {message.fileUrl && !message.isOptimistic && (
                  <button
                    onClick={handleFileDownload}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>

              {!isMobile && isImageFile(message.fileName) && message.fileUrl && (
                <img
                  src={message.fileUrl}
                  alt={message.fileName}
                  className="rounded-lg max-w-full h-auto cursor-pointer break-words [overflow-wrap:anywhere]"
                  onClick={handleFileDownload}
                />
              )}

              {message.isOptimistic && (
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <span className="loading loading-spinner loading-xs"></span> Uploading...
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-1 mt-0.5 px-2 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="opacity-60">
              {message.isOptimistic ? (
                <Clock className="w-3 h-3" />
              ) : message.isRead ? (
                <CheckCheck className="w-3 h-3 text-primary-content" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
