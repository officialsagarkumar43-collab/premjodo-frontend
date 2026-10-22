"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import BackgroundOverlay from "./BackgroundOverlay";

/**
 * Route-aware & Theme-aware Global Background Overlay
 * 
 * Rules:
 * 1. ONLY active in Dark Mode (disabled in White/Light mode).
 * 2. Disabled on Chat & Matches conversations (/user/matches, /user/chat).
 * 3. Enabled on all other pages (Home, Discovery, Profile, Events, etc.).
 */
export default function GlobalBackground() {
  const pathname = usePathname();
  const { isDark, mounted } = useTheme();

  // Exclude chat & direct messaging routes
  const isChatRoute =
    pathname?.startsWith("/user/matches") ||
    pathname?.startsWith("/user/chat");

  // Disable in white/light mode or on chat routes
  if (isChatRoute || !isDark) {
    return null;
  }

  return <BackgroundOverlay fixed={true} />;
}
