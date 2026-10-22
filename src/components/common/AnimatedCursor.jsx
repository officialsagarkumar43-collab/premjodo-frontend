"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function AnimatedCursor() {
  const pathname = usePathname();
  const { isDark, mounted: themeMounted } = useTheme();

  const isUserAccountRoute =
    pathname?.startsWith("/user") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/verify-face");

  const isDarkModeOnly = Boolean(themeMounted && isDark);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isOverNavbar, setIsOverNavbar] = useState(false);

  // Position references for smooth interpolation
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const trailDots = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const isOverNavRef = useRef(false);

  useEffect(() => {
    // Check if the device is desktop / has fine pointer (mouse)
    const mediaFine = window.matchMedia("(pointer: fine)");
    const mediaReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkPointer = () => {
      const hasFinePointer = mediaFine.matches;
      const isWideScreen = window.innerWidth >= 768;
      const prefersReducedMotion = mediaReduceMotion.matches;
      setIsEnabled(hasFinePointer && isWideScreen && !prefersReducedMotion);
    };

    checkPointer();
    window.addEventListener("resize", checkPointer);
    mediaFine.addEventListener?.("change", checkPointer);

    return () => {
      window.removeEventListener("resize", checkPointer);
      mediaFine.removeEventListener?.("change", checkPointer);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || isUserAccountRoute || !isDarkModeOnly) return;

    const checkIfNavbar = (target, clientY) => {
      // Header sticky height is 80px (h-20). Any pointer within top header area or header elements
      if (typeof clientY === "number" && clientY <= 90) return true;
      if (!target) return false;
      return !!(
        target.closest("header") ||
        target.closest("nav") ||
        target.closest("[data-navbar]") ||
        target.closest(".navbar") ||
        target.closest("#main-header") ||
        target.closest("[role='banner']")
      );
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const inNavbar = checkIfNavbar(target, e.clientY);
      if (inNavbar !== isOverNavRef.current) {
        isOverNavRef.current = inNavbar;
        setIsOverNavbar(inNavbar);
        if (inNavbar) {
          trailDots.current = []; // Instantly clear particles when entering header
        }
      }

      // Add a trail particle on fast movement ONLY when strictly below header
      if (!inNavbar && e.clientY > 95 && Math.random() < 0.35) {
        trailDots.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 2,
          alpha: 0.65,
          color: Math.random() > 0.5 ? "244, 63, 94" : "225, 29, 72", // Rose & Pink
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        });

        // Cap trail particles
        if (trailDots.current.length > 25) {
          trailDots.current.shift();
        }
      }
    };

    const handleMouseDown = (e) => {
      if (!checkIfNavbar(e.target, e.clientY)) {
        setIsClicking(true);
      }
    };
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      trailDots.current = [];
    };
    const handleMouseEnter = () => setIsVisible(true);

    // Detect hover over interactive elements
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const inNavbar = checkIfNavbar(target, e.clientY);
      if (inNavbar !== isOverNavRef.current) {
        isOverNavRef.current = inNavbar;
        setIsOverNavbar(inNavbar);
        if (inNavbar) {
          trailDots.current = [];
        }
      }

      if (inNavbar) {
        setIsHovered(false);
        return;
      }

      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("[role='button']") ||
        target.closest(".cursor-pointer") ||
        target.closest("[data-cursor-hover]");

      setIsHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Smooth Canvas Particle & Follower loop
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      // Lerp for outer follower ring
      const lerp = 0.18;
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * lerp;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * lerp;

      // Render particle trail on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = trailDots.current.length - 1; i >= 0; i--) {
          const dot = trailDots.current[i];
          // Do not draw particles inside header zone (Y <= 90)
          if (dot.y <= 90) {
            trailDots.current.splice(i, 1);
            continue;
          }

          dot.alpha -= 0.022;
          dot.size *= 0.95;
          dot.x += dot.vx;
          dot.y += dot.vy;

          if (dot.alpha <= 0 || dot.size <= 0.5) {
            trailDots.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${dot.color}, 0.5)`;
          ctx.fill();
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isEnabled, isVisible, isUserAccountRoute, isDarkModeOnly]);

  if (!isEnabled || isUserAccountRoute || !isDarkModeOnly) return null;

  // Follower bubble and center dot are only visible when not in navbar & below header
  const isPointerInsideNavbar = isOverNavbar || mousePos.current.y <= 88;
  const isFollowerInsideNavbar = isOverNavbar || followerPos.current.y <= 88;
  const cursorVisible = isVisible && !isPointerInsideNavbar;
  const followerVisible = isVisible && !isFollowerInsideNavbar;

  return (
    <>
      {/* Canvas for dynamic movement spark trails */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998] transition-opacity duration-200"
        style={{
          opacity: cursorVisible ? 1 : 0,
        }}
      />

      {/* Outer Floating Ring Follower (Bul Bula / Bubble) */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform transition-[opacity,width,height,border-color,background-color] duration-150 ease-out"
        style={{
          transform: `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) translate(-50%, -50%)`,
          opacity: followerVisible ? 1 : 0,
          width: isClicking ? "28px" : isHovered ? "52px" : "38px",
          height: isClicking ? "28px" : isHovered ? "52px" : "38px",
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isHovered
              ? "bg-rose-500/15 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-110"
              : isClicking
              ? "bg-rose-600/30 border border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-90"
              : "border border-rose-400/60 dark:border-rose-300/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
          }`}
        />
      </div>

      {/* Center Precise Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform transition-[opacity,transform] duration-75"
        style={{
          transform: `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%) scale(${
            isClicking ? 0.6 : isHovered ? 1.4 : 1
          })`,
          opacity: cursorVisible ? 1 : 0,
        }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHovered
              ? "w-2.5 h-2.5 bg-gradient-to-tr from-rose-500 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]"
              : isClicking
              ? "w-3 h-3 bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,1)]"
              : "w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]"
          }`}
        />
      </div>
    </>
  );
}
