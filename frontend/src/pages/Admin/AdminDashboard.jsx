import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLogout, getUsers } from "../../lib/api.js";
import { toast } from "react-hot-toast";
import {
  Shield,
  Users,
  MessageSquare,
  LogOut,
  Calendar,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

const AdminDashboard = ({ authUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const { mutate: logoutMutation } = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.setQueryData(["authUser"], null);
    }
  });

  const handleLogout = () => {
    logoutMutation();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching users...");
      const response = await getUsers();
      console.log("Users response:", response);
      
      if (response && response.success) {
        console.log(`Successfully fetched ${response.users.length} users`);
        setUsers(response.users || []);
      } else {
        console.error("Users fetch failed:", response);
        setError("Failed to fetch users: " + (response?.message || "Invalid response format"));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError("Failed to fetch users: " + (err.response?.data?.message || err.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Compact Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-xs">
                {authUser?.username || authUser?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/messages"
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              <ArrowRight className="w-3 h-3" />
            </Link>
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

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Verified</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {users.filter(user => user.isVerified).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Messages</p>
                <Link 
                  to="/admin/messages"
                  className="text-xl font-bold text-violet-400 hover:text-violet-300 transition-colors mt-1 inline-flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <MessageSquare className="w-8 h-8 text-violet-400" />
            </div>
          </div>
        </div>

        {/* Compact Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Users</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                {users.length}
              </span>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-400">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No users found</p>
                <p className="text-sm">Users will appear here once they register</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.onlineStatus)} rounded-full border-2 border-slate-900`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white truncate">{user.username}</span>
                            <div className="flex items-center gap-2">
                              {user.isVerified ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                user.onlineStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                                user.onlineStatus === 'away' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {user.onlineStatus || 'offline'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-500 font-mono">
                          {user._id.slice(-8)}
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

export default AdminDashboard;