import { Link, useLocation } from "react-router";
import { useState } from "react";
import {
  FiChevronRight,
  FiChevronLeft,
  FiLogOut,
  FiUser,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api.js";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const queryClient = useQueryClient();
  
  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.setQueryData(["authUser"], null);
    },
  });
  
  const handleLogout = () => {
    logoutMutation();
  };
  
  const sidebarWidth = isCollapsed ? "w-12" : "w-40";
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside
      className={`bg-base-300 text-base-content ${sidebarWidth} flex flex-col justify-between h-screen shadow-xl relative py-3 transition-all duration-150 ease-out border-r border-base-200`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-3 right-2 text-base-content/70 hover:text-primary hover:bg-base-200 rounded-full p-1 transition-colors duration-150"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <FiChevronRight size={14} />
        ) : (
          <FiChevronLeft size={14} />
        )}
      </button>

      {/* Navigation Links */}
      <nav className="flex flex-col items-center mt-8 space-y-1 px-1">
        <Link
          to="/"
          className={`relative flex items-center ${
            isCollapsed ? "justify-center w-10 h-10" : "justify-start w-full px-3 py-2"
          } gap-2 rounded-lg hover:bg-base-200 transition-colors duration-150 group ${
            isActive("/") 
              ? "bg-primary/10 text-primary border border-primary/20" 
              : ""
          }`}
        >
          {isActive("/") && !isCollapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r-full"></span>
          )}
          <FiMessageCircle 
            className={`${isActive("/") ? "text-primary" : ""} ${
              isCollapsed ? "text-lg" : "text-base"
            }`} 
          />
          {!isCollapsed && (
            <span className={`text-xs font-medium truncate ${
              isActive("/") ? "text-primary" : ""
            }`}>
              Messages
            </span>
          )}
          {isCollapsed && isActive("/") && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-l-full"></span>
          )}
        </Link>

        <Link
          to="/friends"
          className={`relative flex items-center ${
            isCollapsed ? "justify-center w-10 h-10" : "justify-start w-full px-3 py-2"
          } gap-2 rounded-lg hover:bg-base-200 transition-colors duration-150 group ${
            isActive("/friends") 
              ? "bg-primary/10 text-primary border border-primary/20" 
              : ""
          }`}
        >
          {isActive("/friends") && !isCollapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r-full"></span>
          )}
          <FiUsers 
            className={`${isActive("/friends") ? "text-primary" : ""} ${
              isCollapsed ? "text-lg" : "text-base"
            }`} 
          />
          {!isCollapsed && (
            <span className={`text-xs font-medium truncate ${
              isActive("/friends") ? "text-primary" : ""
            }`}>
              Friends
            </span>
          )}
          {isCollapsed && isActive("/friends") && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-l-full"></span>
          )}
        </Link>
      </nav>

      {/* User Profile & Logout Section */}
      <div className="flex flex-col items-center space-y-2 px-1 pt-3 border-t border-base-200">
        {/* Profile Picture */}
        <Link
          to="/profile"
          className={`relative rounded-full overflow-hidden group transition-colors duration-150 ${
            isCollapsed ? "" : "mb-1"
          }`}
        >
          <img
            src={authUser?.profilepic || "https://via.placeholder.com/32"}
            alt="Profile"
            className={`${isCollapsed ? "w-8 h-8" : "w-9 h-9"} rounded-full object-cover border border-base-100 shadow-sm`}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <FiUser className="text-white text-xs" />
          </div>
        </Link>

        {/* Username */}
        {!isCollapsed && (
          <div className="text-center px-1">
            <p className="text-xs font-medium truncate text-base-content">
              {authUser?.username}
            </p>
            <p className="text-[10px] text-base-content/60 truncate">
              Online
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center ${
            isCollapsed ? "justify-center w-10 h-8" : "justify-start w-full px-3 py-2"
          } gap-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-150 text-base-content/70 group ${
            isCollapsed ? "" : "border border-transparent hover:border-red-200"
          }`}
          title="Logout"
        >
          <FiLogOut className="text-sm" />
          {!isCollapsed && (
            <span className="text-xs font-medium">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;