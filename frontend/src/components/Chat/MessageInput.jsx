import React, { useRef, useState, useEffect } from "react";
import { Send, Paperclip, X, AlertCircle, Mic, Square } from "lucide-react"; // ✅ Added Mic + Square icons

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onSendFile,
  disabled,
}) => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Format file size
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
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file) && onSendFile) onSendFile(file);
    e.target.value = ""; // reset input
  };

  const handleAttachClick = () => {
    setFileError("");
    fileInputRef.current?.click();
  };

  // ✅ AUDIO RECORDING HANDLERS
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        if (validateFile(audioFile) && onSendFile) onSendFile(audioFile);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      setFileError("Microphone access denied or unavailable");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Drag & Drop handlers
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
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file) && onSendFile) onSendFile(file);
  };

  const clearError = () => setFileError("");

  return (
    <div className="relative">
      {/* File error alert */}
      {fileError && (
        <div className="px-2 sm:px-3 py-1.5 bg-error/10 border-l-4 border-error flex items-center gap-2 text-error text-xs">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="flex-1">{fileError}</span>
          <button onClick={clearError} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`p-2 sm:p-3 bg-base-100 flex items-center gap-1.5 sm:gap-2 border-t transition-all ${
          dragOver ? "bg-primary/10 border-primary/50" : "border-base-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attach File */}
        <button
          type="button"
          className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
          onClick={handleAttachClick}
          disabled={disabled}
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* ✅ Mic Button */}
        <button
          type="button"
          className={`btn btn-ghost btn-xs sm:btn-sm btn-circle ${
            isRecording ? "text-error animate-pulse" : ""
          }`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={disabled}
          title={isRecording ? "Stop recording" : "Record audio"}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* File Input */}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/mp4,audio/mp3,audio/webm,audio/ogg,audio/wav,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
        />

        {/* Message Input */}
        <textarea
          placeholder={isRecording ? "Recording audio..." : "Type a message..."}
          className="textarea textarea-sm flex-1 bg-base-200 border-none resize-none text-sm leading-tight max-h-36 overflow-y-auto p-2 rounded-md sm:max-h-48"
          value={isRecording ? "" : newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={disabled || isRecording}
        />

        {/* Recording Timer */}
        {isRecording && (
          <span className="text-xs text-error font-medium min-w-[40px] text-center">
            {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
          </span>
        )}

        {/* Send Button */}
        <button
          className={`btn btn-xs sm:btn-sm btn-circle ${
            newMessage.trim() ? "btn-primary shadow-lg hover:scale-105" : "btn-ghost"
          }`}
          onClick={onSendMessage}
          disabled={disabled || !newMessage.trim()}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
