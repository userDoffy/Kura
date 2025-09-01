import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { adminLogout, getMessages } from "../../lib/api";
import {
  Shield,
  MessageSquare,
  LogOut,
  User,
  Lock,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Image,
  FileText,
  Paperclip,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";

const AdminMessagesPage = ({ authUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/admin/login");
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching messages...");
      const response = await getMessages();
      console.log("Messages response:", response);
      
      if (response && response.success) {
        console.log(`Successfully fetched ${response.messages.length} messages`);
        setMessages(response.messages || []);
      } else {
        console.error("Messages fetch failed:", response);
        setError("Failed to fetch messages: " + (response?.message || "Invalid response format"));
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-400" />;
      case 'file':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Compact Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Messages Monitor</h1>
              <p className="text-slate-400 text-xs">Encrypted message overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-300 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Compact Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-slate-400 text-xs font-medium">Total</p>
                <p className="text-lg font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-slate-400 text-xs font-medium">Text</p>
                <p className="text-lg font-bold text-white">
                  {messages.filter(m => m.messageType === 'text' || !m.messageType).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-slate-400 text-xs font-medium">Images</p>
                <p className="text-lg font-bold text-white">
                  {messages.filter(m => m.messageType === 'image').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-slate-400 text-xs font-medium">Files</p>
                <p className="text-lg font-bold text-white">
                  {messages.filter(m => m.messageType === 'file').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Messages List */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-white">Recent Messages</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                {messages.length}
              </span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No messages found</p>
                <p className="text-sm">Messages will appear here once users start chatting</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {messages.map((message, index) => (
                  <div
                    key={message._id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Message Type Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getMessageIcon(message.messageType)}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-blue-400" />
                              <span className="text-white font-medium truncate max-w-24">
                                {message.senderId?.username || "Unknown"}
                              </span>
                            </div>
                            <span className="text-slate-500">→</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-emerald-400" />
                              <span className="text-white font-medium truncate max-w-24">
                                {message.receiverId?.username || "Unknown"}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                        
                        {/* Encrypted Content Preview */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-400 text-xs font-medium">
                                {message.messageType || 'text'} message
                              </span>
                              {message.fileName && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate max-w-32">{message.fileName}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {message.fileSize && (
                                <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                                  {formatFileSize(message.fileSize)}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                {message.read ? (
                                  <Eye className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-slate-500" />
                                )}
                                {message.deleted && (
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-300 text-xs font-mono bg-slate-900/50 p-2 rounded border border-slate-700 truncate">
                            {message.content ? 
                              `${message.content.substring(0, 80)}${message.content.length > 80 ? '...' : ''}` : 
                              "No content available"
                            }
                          </p>
                        </div>
                        
                        {/* Status and ID */}
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${
                              message.read 
                                ? "bg-emerald-500/20 text-emerald-400" 
                                : "bg-slate-500/20 text-slate-400"
                            }`}>
                              {message.read ? "Read" : "Unread"}
                            </span>
                            {message.deleted && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                Deleted
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 font-mono">
                            {message._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;