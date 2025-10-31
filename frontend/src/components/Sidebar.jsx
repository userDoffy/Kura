import { Link, useLocation } from "react-router";
import { FiLogOut, FiMessageCircle, FiUsers } from "react-icons/fi";
import useAuthUser from "../hooks/useAuthUser";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { logout } from "../lib/api";
import { toast } from "react-hot-toast";
import ThemeSelector from "./ThemeSelector";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out");
      queryClient.setQueryData(["authUser"], null);
    },
  });

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-12 sm:w-14 bg-base-200 text-base-content h-screen flex flex-col justify-between items-center border-r border-base-300 py-3 fixed left-0 top-0 z-50">

      {/* ========== TOP (Logo) ========== */}
      <div className="flex flex-col items-center gap-1">
        <Link to="/" className="flex flex-col items-center text-center">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-[10px] font-semibold text-primary hidden sm:block">
            Kura
          </span>
        </Link>
      </div>

      {/* ========== BOTTOM ICONS ========== */}
      <div className="flex flex-col gap-3 items-center mb-1">

        {/* Chats */}
        <Link
          to="/"
          className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-primary/10 transition ${
            isActive("/") && "bg-primary text-white shadow-md"
          }`}
        >
          <FiMessageCircle size={18} className="sm:w-5 sm:h-5" />
        </Link>

        {/* Friends */}
        <Link
          to="/friends"
          className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-primary/10 transition ${
            isActive("/friends") && "bg-primary text-white shadow-md"
          }`}
        >
          <FiUsers size={18} className="sm:w-5 sm:h-5" />
        </Link>

        {/* Profile */}
        <Link to="/profile">
          <img
            src={authUser?.profilepic || "https://via.placeholder.com/40"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-base-300 object-cover hover:border-primary transition"
            alt="Profile"
          />
        </Link>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Logout */}
        <button
          onClick={() => logoutMutation()}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
        >
          <FiLogOut size={16} className="sm:w-4 sm:h-4" />
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
