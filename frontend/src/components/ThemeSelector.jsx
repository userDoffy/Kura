import React, { useState } from 'react';
import { FiMoon, FiSun, FiDroplet } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import { useThemeStore } from "../store/useThemeStore";

const THEMES = [
  { name: 'light', color: 'bg-yellow-300', icon: <FiSun /> },
  { name: 'dark', color: 'bg-gray-800', icon: <FiMoon /> },
  { name: 'dracula', color: 'bg-purple-800', icon: <FaPalette /> },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle hover:bg-base-200"
        onClick={() => setOpen(!open)}
        title="Select Theme"
      >
        <FaPalette className="text-xl" />
      </button>

      {open && (
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-xl rounded-box w-48 bg-base-100 border border-base-200 z-50 animate-fadeIn"
        >
          {THEMES.map((t) => (
            <li key={t.name}>
              <button
                onClick={() => {
                  setTheme(t.name);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-base-200 transition ${
                  theme === t.name ? 'bg-primary text-primary-content shadow-md' : ''
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${t.color} border border-base-300`}></span>
                <span className="capitalize">{t.name}</span>
                {t.icon}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSelector;
