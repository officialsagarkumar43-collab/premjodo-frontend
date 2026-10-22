"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/common/utils";

export function ThemeToggle({
  variant = "icon",
  className = "",
  showLabel = false,
}) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Render placeholder to avoid layout shift before client mounts
    if (variant === "segment") {
      return (
        <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-10 w-64" />
      );
    }
    return (
      <button
        type="button"
        aria-label="Toggle Theme"
        suppressHydrationWarning
        className={cn(
          "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border border-transparent bg-zinc-100/50 dark:bg-zinc-800/50 opacity-60 pointer-events-none",
          className
        )}
      >
        <Moon className="w-4 h-4 text-zinc-400" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  // 1. Three-way Segment variant (Light / Dark / System)
  if (variant === "segment") {
    const options = [
      { id: "light", label: "White", icon: Sun },
      { id: "dark", label: "Dark", icon: Moon },
      { id: "system", label: "System", icon: Laptop },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={cn(
          "inline-flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-inner",
          className
        )}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs poppins-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm shadow-zinc-950/10 font-bold scale-[1.02]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isSelected && "text-rose-500"
                )}
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Full button row for Mobile Navigation Drawer
  if (variant === "button" || showLabel) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={cn(
          "flex items-center justify-between w-full py-3 px-4 rounded-xl text-xs poppins-semibold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-500/50 shadow-sm transition-all cursor-pointer active:scale-[0.98]",
          className
        )}
        aria-label={`Switch to ${isDark ? "White" : "Dark"} mode`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
              isDark
                ? "bg-amber-500/15 text-amber-400"
                : "bg-rose-500/10 text-rose-600"
            )}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 animate-spin-slow" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </div>
          <span>
            Mode:{" "}
            <strong className="text-zinc-900 dark:text-white font-bold">
              {isDark ? "Dark Mode" : "White Mode"}
            </strong>
          </span>
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
          Toggle
        </span>
      </button>
    );
  }

  // 3. Clean Icon toggle button with smooth micro-animation
  return (
    <button
      onClick={toggleTheme}
      type="button"
      suppressHydrationWarning
      className={cn(
        "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group active:scale-95",
        className
      )}
      title={isDark ? "Switch to White (Light) Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to White Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Visible in Dark Mode to switch to Light) */}
        <Sun
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-all duration-300 absolute",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
        {/* Moon Icon (Visible in Light Mode to switch to Dark) */}
        <Moon
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300 group-hover:text-rose-600 transition-all duration-300 absolute",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>
    </button>
  );
}
