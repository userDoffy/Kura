import { Link } from "react-router";
import { FiBell } from "react-icons/fi";
import ThemeSelector from "./ThemeSelector";

const Header = () => {
  return (
    <header className="bg-base-300 shadow-md border-b border-base-200 px-4  flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link
          to="/"
          className="group flex items-center gap-2 hover:scale-105 transition-transform duration-200"
        >
          {/* Logo Icon */}
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-focus rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          
          {/* Logo Text */}
          <div className="flex flex-col">
            <h1 className="text-lg md:text-base font-bold text-primary group-hover:text-primary-focus transition-colors duration-200">
              Kura Chat
            </h1>
            <span className="text-[10px] text-base-content/60 -mt-0.5 hidden sm:block">
              Connect instantly
            </span>
          </div>
        </Link>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">

        {/* Theme Selector */}
        <div className="hover:scale-105 transition-transform duration-200">
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;