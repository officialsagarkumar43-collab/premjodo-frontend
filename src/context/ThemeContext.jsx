"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  mounted: false,
});

const STORAGE_KEY = "prem_jodo_theme";

const subscribeTheme = (callback) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener("prem_jodo_theme_change", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("prem_jodo_theme_change", callback);
    mediaQuery.removeEventListener("change", callback);
  };
};

const getThemeSnapshot = () => {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(STORAGE_KEY) || "light";
  } catch {
    return "light";
  }
};

const getServerSnapshot = () => "light";

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = React.useState(false);

  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  let isDark = false;
  if (theme === "dark") {
    isDark = true;
  } else if (theme === "light") {
    isDark = false;
  }

  const resolvedTheme = isDark ? "dark" : "light";

  // Safely update DOM in an effect
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) {
      if (!root.classList.contains("dark")) root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  }, [isDark, mounted]);

  const setTheme = (newTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      window.dispatchEvent(new Event("prem_jodo_theme_change"));
    } catch {
      // Storage access safety
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
