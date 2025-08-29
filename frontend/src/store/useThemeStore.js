import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Kura_Theme") || "light",
  setTheme: (theme) => {
    localStorage.setItem("Kura_Theme", theme);
    set({ theme });
  },
}));
