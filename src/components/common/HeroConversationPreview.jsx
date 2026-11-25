"use client";

import React, { useRef, useEffect } from "react";

const CHIPS = [
  { emoji: "🎧", text: "Music" },
  { emoji: "✈️", text: "Travel" },
  { emoji: "🎮", text: "Gaming" },
  { emoji: "🍥", text: "Anime" },
  { emoji: "⚽", text: "Football" },
  { emoji: "🐶", text: "Pets" },
];

export function HeroConversationPreview({ onOpenAuth }) {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    const v1 = videoRef1.current;
    const v2 = videoRef2.current;
    if (!v1 || !v2) return;

    v1.muted = true;
    v2.muted = true;

    // Synchronized playback so when one talks, the other listens and reacts
    const syncPlay = () => {
      v1.currentTime = 0;
      v2.currentTime = 0;
      Promise.all([v1.play(), v2.play()]).catch(() => {
        // Unlock on first user touch/click if browser blocks unprompted autoplay
        const unlock = () => {
          v1.play().catch(() => {});
          v2.play().catch(() => {});
          window.removeEventListener("click", unlock);
          window.removeEventListener("touchstart", unlock);
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
      });
    };

    // When primary video ends, restart both at the exact same instant to preserve reaction dialogue sync
    const handleLoop = () => {
      v1.currentTime = 0;
      v2.currentTime = 0;
      v1.play().catch(() => {});
      v2.play().catch(() => {});
    };

    v1.addEventListener("ended", handleLoop);
    syncPlay();

    return () => {
      v1.removeEventListener("ended", handleLoop);
    };
  }, []);

  return (
    <div
      className="hero-illu"
      onClick={() => onOpenAuth?.("register")}
      title="Click to discover connections on Prem Jodo"
    >
      <div className="hero-illu__frame">
        <div
          className="hero-illu__art"
          role="img"
          aria-label="Friends laughing together on live video chat"
        >
          {/* SVG ClipPath Definitions matching chitchat.gg */}
          <svg className="hero-illu__svg-defs" aria-hidden="true">
            <defs>
              <clipPath id="hi-sq" clipPathUnits="objectBoundingBox">
                <path d="M0.3 0H0.7C0.934 0 1 0.066 1 0.3V0.7C1 0.934 0.934 1 0.7 1H0.3C0.066 1 0 0.934 0 0.7V0.3C0 0.066 0.066 0 0.3 0Z" />
              </clipPath>
              <clipPath id="hi-tall" clipPathUnits="objectBoundingBox">
                <path d="M0.3 0H0.7C0.934 0 1 0.0322 1 0.1463V0.8538C1 0.9678 0.934 1 0.7 1H0.3C0.066 1 0 0.9678 0 0.8538V0.1463C0 0.0322 0.066 0 0.3 0Z" />
              </clipPath>
              <clipPath id="hi-blob" clipPathUnits="objectBoundingBox">
                <path d="M.52.02C.76 0 .99.2.97.46.95.72.74.98.47.97.21.96.01.74.03.47.05.21.28.04.52.02Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Background Drop Shadow */}
          <svg className="hero-illu__shadow" viewBox="0 0 480 480" aria-hidden="true">
            <rect width="234" height="234" clipPath="url(#hi-sq)" />
            <rect y="246" width="234" height="234" clipPath="url(#hi-sq)" />
            <rect x="246" width="234" height="480" clipPath="url(#hi-tall)" />
          </svg>

          {/* Left Column: Two Video Tiles in Real-Time Reaction Sync */}
          <div className="hero-illu__tiles">
            {/* Top Video: Russian Girl (Chloe) talking & smiling */}
            <video
              ref={videoRef1}
              className="hero-illu__video"
              src="/videos/hero-1.mp4"
              poster="/videos/hero-1.webp"
              autoPlay
              muted
              playsInline
              preload="auto"
              width="480"
              height="480"
            />

            {/* Bottom Video: Guy (Jacob) listening, reacting & replying */}
            <video
              ref={videoRef2}
              className="hero-illu__video"
              src="/videos/hero-2.mp4"
              poster="/videos/hero-2.webp"
              autoPlay
              muted
              playsInline
              preload="auto"
              width="480"
              height="480"
            />
          </div>

          {/* Right Column: Tall Fixed Chat Window (Static Layout matching Chitchat) */}
          <div className="hero-illu__chat">
            {/* Chloe Avatar Selfie Thumbnail */}
            <img
              className="hero-illu__avatar"
              src="/images/chitchat-avatar.webp"
              alt="Chloe"
              style={{
                left: "9.402%",
                top: "3.125%",
                width: "14.53%",
                height: "7.083%",
              }}
            />

            {/* Night Photo Message Thumbnail */}
            <img
              className="hero-illu__photo"
              src="/images/chitchat-photo.webp"
              alt="Night photo"
              style={{
                left: "9.402%",
                top: "56.667%",
                width: "64.103%",
                height: "20.833%",
              }}
            />

            {/* SVG Text & Controls Overlay (Fixed Chat - All Messages Visible Simultaneously) */}
            <svg className="hero-illu__text" viewBox="0 0 234 480" aria-hidden="true">
              {/* Header: Name and Status */}
              <text className="hero-illu__header" x="67" y="31">
                Chloe
              </text>
              <circle className="hero-illu__status" cx="70" cy="41" r="3.5" />
              <text className="hero-illu__header-sub" x="79" y="44">
                online
              </text>
              <line className="hero-illu__rule" x1="22" y1="64" x2="212" y2="64" />

              {/* Message 1: Jacob */}
              <text className="hero-illu__name-row" x="22" y="86">
                <tspan className="hero-illu__who hero-illu__who--a">Jacob</tspan>
                <tspan className="hero-illu__time" dx="7">9:41 PM</tspan>
              </text>
              <text className="hero-illu__msg" x="22" y="110">
                hey! where you from?
              </text>

              {/* Message 2: Chloe */}
              <text className="hero-illu__name-row" x="22" y="144">
                <tspan className="hero-illu__who hero-illu__who--b">Chloe</tspan>
                <tspan className="hero-illu__time" dx="7">9:41 PM</tspan>
              </text>
              <text className="hero-illu__msg" x="22" y="168">
                London, you?
              </text>

              {/* Message 3: Jacob */}
              <text className="hero-illu__name-row" x="22" y="202">
                <tspan className="hero-illu__who hero-illu__who--a">Jacob</tspan>
                <tspan className="hero-illu__time" dx="7">9:42 PM</tspan>
              </text>
              <text className="hero-illu__msg" x="22" y="226">
                no way, I visit soon
              </text>

              {/* Message 4 Header: Chloe */}
              <text className="hero-illu__name-row" x="22" y="260">
                <tspan className="hero-illu__who hero-illu__who--b">Chloe</tspan>
                <tspan className="hero-illu__time" dx="7">9:43 PM</tspan>
              </text>

              {/* Live Typing Indicator */}
              <text className="hero-illu__typing" x="22" y="410">
                Chloe is typing…
              </text>

              {/* Composer Box at Bottom */}
              <rect className="hero-illu__composer" x="0" y="428" width="234" height="52" />
              <line className="hero-illu__rule" x1="0" y1="428" x2="234" y2="428" />
              <text className="hero-illu__placeholder" x="22" y="458">
                Type a message
              </text>
              <circle className="hero-illu__send" cx="200" cy="454" r="13" />
              <path
                className="hero-illu__send-icon"
                d="M0,-5 L4.5,0.5 L1.6,0.5 L1.6,5 L-1.6,5 L-1.6,0.5 L-4.5,0.5 Z"
                transform="translate(200 454)"
              />
            </svg>
          </div>
        </div>

        {/* Floating Interest Chips on Left Edge */}
        <div className="hero-illu__interests" aria-label="Interests">
          {CHIPS.map((chip, index) => (
            <span
              key={chip.text}
              className="hero-illu__chip"
              style={{ "--chip-i": index }}
            >
              <span className="hero-illu__chip-emoji" aria-hidden="true">
                {chip.emoji}
              </span>
              <span>{chip.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroConversationPreview;
