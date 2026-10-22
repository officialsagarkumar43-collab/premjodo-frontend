import React from "react";
import { cn } from "@/lib/common/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl poppins-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20",
    gradient:
      "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white hover:opacity-95 shadow-lg shadow-rose-500/25",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    outline:
      "border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    ghost:
      "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 h-8 poppins-medium",
    md: "text-sm px-4 py-2 h-10 poppins-semibold",
    lg: "text-base px-6 py-3 h-12 poppins-bold",
    icon: "p-2 h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
