import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { FaPalette } from "react-icons/fa";
import { useThemeStore } from "../store/useThemeStore";

const THEMES = [
  { name: "light", icon: <FiSun /> },
  { name: "dark", icon: <FiMoon /> },
  { name: "dracula", icon: <FaPalette /> },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.name === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].name);
  };

  const current = THEMES.find((t) => t.name === theme);

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${theme} (Click to switch)`}
      className="w-full flex items-center justify-center p-3 hover:bg-base-200 transition rounded-lg"
    >
      <span className="text-xl">{current.icon}</span>
    </button>
  );
};

export default ThemeSelector;
