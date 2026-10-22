"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/common/utils";
import { useTheme } from "@/context/ThemeContext";

/**
 * Reusable Interactive Constellation / Star Network (Plexus) Background Overlay
 * 
 * High visibility 60fps Star Constellation with bright glowing nodes & connecting network lines.
 */
export default function BackgroundOverlay({
  variant = "constellation",
  intensity = "medium",
  showConnections = true,
  interactive = true,
  fixed = true,
  darkModeOnly = true,
  particleCount,
  className = "",
  children,
}) {
  const { isDark, mounted } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 180, active: false });
  const animFrameId = useRef(null);

  // If darkModeOnly is enabled and current theme is light, disable overlay
  const shouldRender = !darkModeOnly || !mounted || isDark;

  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse Tracking for interactive Plexus effect
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // Determine particle count (80 - 120 on desktop)
    const count =
      typeof particleCount === "number"
        ? particleCount
        : Math.min(110, Math.max(55, Math.floor((width * height) / 14000)));

    // Prem Jodo Vibrant Palette for Star Nodes
    const colors = [
      { r: 244, g: 63, b: 94, name: "rose" },     // Rose-500 (#f43f5e)
      { r: 236, g: 72, b: 153, name: "pink" },    // Pink-500 (#ec4899)
      { r: 251, g: 113, b: 133, name: "lightrose" }, // Rose-400 (#fb7185)
      { r: 168, g: 85, b: 247, name: "violet" },  // Purple-500 (#a855f7)
      { r: 255, g: 255, b: 255, name: "white" },   // Bright Starlight
      { r: 255, g: 215, b: 0, name: "gold" },      // Golden Spark
    ];

    // Initialize Star Particles
    const particles = [];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const radius = Math.random() * 2.5 + 1.2;
      // Slightly active drift speed so movement is clearly seen
      const speed = Math.random() * 0.9 + 0.4;
      const angle = Math.random() * Math.PI * 2;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        color,
        baseAlpha: Math.random() * 0.45 + 0.55, // High initial alpha (0.55 - 1.0)
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
        isSparkle: Math.random() > 0.7,
      });
    }

    const maxDistance = Math.min(width, height) > 768 ? 160 : 120;
    const maxDistanceSq = maxDistance * maxDistance;
    const mouseRadiusSq = mouseRef.current.radius * mouseRef.current.radius;

    // Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and Draw Star Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on borders with soft wrap
        if (p.x < -30) p.x = width + 30;
        else if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        else if (p.y > height + 30) p.y = -30;

        // Twinkling pulse
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = Math.max(
          0.35,
          Math.min(1, p.baseAlpha + Math.sin(p.pulsePhase) * 0.35)
        );

        // Interactive mouse gravity / gentle push
        if (interactive && mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq && distSq > 0) {
            const force = (1 - distSq / mouseRadiusSq) * 2;
            p.x += (dx / Math.sqrt(distSq)) * force;
            p.y += (dy / Math.sqrt(distSq)) * force;
          }
        }

        // Draw Glowing Star
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.95)`;
        ctx.shadowBlur = p.isSparkle ? 14 : 7;
        ctx.fill();

        // Extra twinkle cross for special sparkle stars
        if (p.isSparkle && currentAlpha > 0.6) {
          const crossSize = p.radius * 3;
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - crossSize, p.y);
          ctx.lineTo(p.x + crossSize, p.y);
          ctx.moveTo(p.x, p.y - crossSize);
          ctx.lineTo(p.x, p.y + crossSize);
          ctx.stroke();
        }
        ctx.restore();

        // 2. Draw Constellation Connection Lines between Stars
        if (showConnections) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistanceSq) {
              const distance = Math.sqrt(distSq);
              // Vibrant connecting lines
              const lineAlpha = (1 - distance / maxDistance) * 0.42;

              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(244, 63, 94, ${lineAlpha})`;
              ctx.lineWidth = 1.1;
              ctx.stroke();
            }
          }

          // 3. Connect Stars to Mouse Cursor when nearby
          if (interactive && mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < mouseRadiusSq) {
              const distance = Math.sqrt(distSq);
              const lineAlpha = (1 - distance / mouseRef.current.radius) * 0.65;

              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
              ctx.strokeStyle = `rgba(236, 72, 153, ${lineAlpha})`;
              ctx.lineWidth = 1.4;
              ctx.stroke();
            }
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [variant, showConnections, interactive, particleCount, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        fixed ? "fixed inset-0 w-full h-full" : "absolute inset-0 w-full h-full",
        "pointer-events-none overflow-hidden select-none z-0",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Deep Ambient Soft Glow Behind Constellation Canvas */}
      <div className="absolute inset-0 overflow-hidden opacity-60 dark:opacity-45 transition-opacity duration-1000">
        {/* Top-left soft rose-pink ambient orb */}
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] max-w-[650px] h-[55vw] max-h-[650px] rounded-full bg-gradient-to-br from-rose-600/25 via-pink-600/15 to-transparent blur-[110px] animate-pulse [animation-duration:9s]" />

        {/* Center-right amber-rose warm glow */}
        <div className="absolute top-[30%] -right-[10%] w-[50vw] max-w-[580px] h-[50vw] max-h-[580px] rounded-full bg-gradient-to-tl from-pink-600/20 via-purple-600/15 to-transparent blur-[100px] animate-pulse [animation-duration:12s] [animation-delay:2s]" />

        {/* Bottom-left violet-rose accent */}
        <div className="absolute -bottom-[10%] left-[10%] w-[45vw] max-w-[500px] h-[45vw] max-h-[500px] rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-500/15 to-transparent blur-[120px] animate-pulse [animation-duration:14s] [animation-delay:4s]" />
      </div>

      {/* 2. Live Interactive Constellation / Star Mesh Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {children}
    </div>
  );
}

export { BackgroundOverlay, BackgroundOverlay as AmbientOverlay };
