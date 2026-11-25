"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

const PROFILES = [
  {
    id: 1,
    image: "/images/hero-sunset-couple.jpg?v=3",
  },
  {
    id: 2,
    image: "/images/hero-couple-lift.jpg?v=1",
  },
  {
    id: 3,
    image: "/images/hero-couple-lake.jpg?v=1",
  },
];

export function HeroCardSwiper({ onOpenAuth }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'right' | 'left' | 'up' | null
  const [isSwiping, setIsSwiping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentProfile = useMemo(() => PROFILES[currentIndex], [currentIndex]);
  const nextProfile = useMemo(
    () => PROFILES[(currentIndex + 1) % PROFILES.length],
    [currentIndex]
  );

  const triggerSwipe = useCallback(
    (dir = "right") => {
      if (isSwiping) return;
      setSwipeDirection(dir);
      setIsSwiping(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PROFILES.length);
        setSwipeDirection(null);
        setIsSwiping(false);
      }, 550);
    },
    [isSwiping]
  );

  // Automatic run mode: triggers swipe every 3.8s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      triggerSwipe("right");
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, triggerSwipe]);

  return (
    <div
      className="hero-card-stack-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Soft ambient romantic glow */}
      <div className="hero-ambient-glow" />

      {/* Behind Next Card (Slides forward on swipe) */}
      <div
        className="hero-back-card"
        style={{
          backgroundImage: `url('${nextProfile.image}')`,
          transition: isSwiping ? "all 0.55s cubic-bezier(0.34, 1.3, 0.64, 1)" : "none",
          transform: isSwiping
            ? "rotate(-2deg) translate(0px, 0px) scale(1)"
            : "rotate(6deg) translate(28px, -10px) scale(0.97)",
          opacity: isSwiping ? 0.95 : 0.65,
          zIndex: isSwiping ? 3 : 2,
        }}
      />

      {/* Foreground Active Card */}
      <div
        className={`hero-main-card ${isSwiping ? `swiping-${swipeDirection}` : ""}`}
        onClick={() => triggerSwipe("right")}
        style={{
          backgroundImage: `url('${currentProfile.image}')`,
          transform: isSwiping
            ? swipeDirection === "right"
              ? "translate(340px, -20px) rotate(25deg) scale(1.05)"
              : swipeDirection === "left"
              ? "translate(-340px, -20px) rotate(-25deg) scale(1.05)"
              : "translateY(-360px) rotate(0deg) scale(0.95)"
            : undefined,
          opacity: isSwiping ? 0 : 1,
          transition: isSwiping
            ? "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease"
            : undefined,
          zIndex: 4,
          cursor: "pointer",
          pointerEvents: isSwiping ? "none" : "auto",
        }}
      />
    </div>
  );
}
