"use client";

import React from "react";

export const LANGUAGE_SYMBOLS = {
  en: "A",
  hi: "अ",
  pa: "ਅ",
  bho: "भ",
  mai: "म",
  te: "అ",
  bn: "অ",
  gu: "અ",
  mr: "म",
  ta: "அ",
};

/**
 * Dynamic Language Symbol/Icon Component
 * Renders the native character symbol corresponding to the active language (e.g. 'A', 'अ', 'ਅ', 'অ', etc.)
 */
export function LanguageIcon({ code = "en", symbol, className = "", size = "sm" }) {
  const char = symbol || LANGUAGE_SYMBOLS[code] || "A";

  const sizeClasses = {
    xs: "text-[11px] w-3.5 h-3.5",
    sm: "text-xs w-4 h-4",
    md: "text-sm w-5 h-5",
    lg: "text-base w-6 h-6",
    xl: "text-xl w-7 h-7",
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold font-sans select-none leading-none shrink-0 ${sizeClasses[size] || ""} ${className}`}
      aria-hidden="true"
    >
      {char}
    </span>
  );
}

export default LanguageIcon;
