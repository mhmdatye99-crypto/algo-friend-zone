import { useState, useEffect, useCallback } from "react";

export function useThemeMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("nexus-theme");
    if (saved === null) return true; // default to dark
    return saved === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("nexus-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("nexus-theme", "light");
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return { isDark, toggle };
}
