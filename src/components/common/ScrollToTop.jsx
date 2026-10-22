"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isUserRoute = pathname?.startsWith("/user");

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Hide in fixed user views
  if (pathname === "/user" || pathname === "/user/" || pathname?.startsWith("/user/matches")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className={`fixed ${isUserRoute ? "bottom-20 sm:bottom-6" : "bottom-6"} right-4 sm:right-6 z-40 sm:z-50 p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 text-white shadow-xl shadow-rose-600/30 border border-white/20 hover:shadow-rose-600/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group focus:outline-none ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
