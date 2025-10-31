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
    <aside
      className="bg-base-200 text-base-content h-screen flex flex-col justify-between items-center
  border-r border-base-300 w-14 lg:w-16 p-2 fixed top-0 left-0 z-50"
    >
      {/* TOP: Logo */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <Link to="/" className="flex flex-col items-center text-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-xs">
            K
          </div>
          <span className="text-[9px] font-semibold text-primary hidden lg:block">
            Kura
          </span>
        </Link>
      </div>

      {/* BOTTOM: Icons */}
      <div className="flex flex-col gap-2 sm:gap-3 items-center mb-2">
        <Link
          to="/"
          className={`p-2 rounded-lg flex items-center justify-center hover:bg-primary/10 transition ${
            isActive("/") && "bg-primary text-white shadow-md"
          }`}
        >
          <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        <Link
          to="/friends"
          className={`p-2 rounded-lg flex items-center justify-center hover:bg-primary/10 transition ${
            isActive("/friends") && "bg-primary text-white shadow-md"
          }`}
        >
          <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        <Link to="/profile">
          <img
            src={authUser?.profilepic || "https://via.placeholder.com/40"}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-base-300 object-cover hover:border-primary transition"
            alt="Profile"
          />
        </Link>

        {/* Theme Selector */}
        <ThemeSelector className="!p-1 sm:!p-2" />

        {/* Logout */}
        <button
          onClick={() => logoutMutation()}
          className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition"
        >
          <FiLogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
