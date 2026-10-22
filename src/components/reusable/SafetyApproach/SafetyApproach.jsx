"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";

/**
 * 1. 3D Rose & Sapphire Prem Shield Illustration
 * Custom 3D Shield with glowing heart & security checkmark
 */
function PremShield3D() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="safety-svg-art"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Shield Outer Gradient */}
        <linearGradient id="shieldRoseOuter" x1="40" y1="20" x2="200" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="40%" stopColor="#e11d48" />
          <stop offset="80%" stopColor="#9f1239" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>

        {/* Inner Glass Glow */}
        <radialGradient id="shieldInnerGlow" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#f43f5e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#881337" stopOpacity="1" />
        </radialGradient>

        {/* Specular Highlight */}
        <linearGradient id="shieldSpecular" x1="60" y1="30" x2="180" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Glow Shadow */}
        <filter id="shieldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#be123c" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ambient Floor Shadow */}
      <ellipse cx="120" cy="216" rx="65" ry="12" fill="#881337" fillOpacity="0.22" filter="blur(8px)" />

      {/* Outer 3D Shield Body */}
      <path
        d="M120 22
           C155 22, 196 34, 196 66
           C196 132, 168 184, 120 212
           C72 184, 44 132, 44 66
           C44 34, 85 22, 120 22 Z"
        fill="url(#shieldRoseOuter)"
        stroke="#fecdd3"
        strokeWidth="3.5"
        strokeLinejoin="round"
        filter="url(#shieldGlowFilter)"
      />

      {/* Inner 3D Glass Layer */}
      <path
        d="M120 34
           C148 34, 182 44, 182 72
           C182 126, 158 170, 120 196
           C82 170, 58 126, 58 72
           C58 44, 92 34, 120 34 Z"
        fill="url(#shieldInnerGlow)"
      />

      {/* Specular Highlight Arc */}
      <path
        d="M70 48
           C100 36, 140 36, 170 48
           C150 72, 90 72, 70 48 Z"
        fill="url(#shieldSpecular)"
      />

      {/* Center 3D Heart Symbol */}
      <path
        d="M120 148
           C120 148, 88 124, 88 100
           C88 88, 98 78, 110 78
           C116 78, 120 82, 120 82
           C120 82, 124 78, 130 78
           C142 78, 152 88, 152 100
           C152 124, 120 148, 120 148 Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Embedded Sparkle Checkmark on Heart */}
      <path
        d="M108 102 L116 112 L134 90"
        stroke="#e11d48"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 2. 3D Safe Encrypted Chat Bubble Illustration
 * Custom 3D Dual-Layer Capsule with security lock
 */
function SafeChat3D() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="safety-svg-art"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Chat Bubble Body Gradient */}
        <linearGradient id="chatBubbleGrad" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="85%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Lock Gold Gradient */}
        <linearGradient id="lockGold" x1="90" y1="80" x2="150" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        {/* Chat Glass Specular */}
        <linearGradient id="chatHighlight" x1="60" y1="50" x2="180" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Floor Shadow */}
      <ellipse cx="120" cy="214" rx="68" ry="12" fill="#0369a1" fillOpacity="0.2" filter="blur(8px)" />

      {/* Main 3D Bubble Body with Tail */}
      <path
        d="M60 60
           C60 42, 75 28, 120 28
           C165 28, 180 42, 180 60
           L180 120
           C180 138, 165 152, 120 152
           C105 152, 94 156, 75 174
           C78 160, 75 152, 60 152
           C45 152, 60 138, 60 120
           Z"
        fill="url(#chatBubbleGrad)"
        stroke="#bae6fd"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Glossy Top Specular Arc */}
      <path
        d="M75 42
           C100 34, 140 34, 165 42
           C150 62, 90 62, 75 42 Z"
        fill="url(#chatHighlight)"
      />

      {/* Golden 3D Padlock Loop (Shackle) */}
      <path
        d="M106 96
           L106 82
           C106 72, 112 66, 120 66
           C128 66, 134 72, 134 82
           L134 96"
        stroke="#fef08a"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Padlock Body */}
      <rect
        x="96"
        y="92"
        width="48"
        height="40"
        rx="8"
        fill="url(#lockGold)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />

      {/* Padlock Keyhole */}
      <circle cx="120" cy="108" r="4.5" fill="#451a03" />
      <polygon points="118,108 122,108 124,122 116,122" fill="#451a03" />

      {/* Sparkle Glint */}
      <circle cx="138" cy="98" r="2.5" fill="#ffffff" />
    </svg>
  );
}

/**
 * 3. 3D Privacy & Ghost Shield Beacon Illustration
 * Custom 3D Floating Iris/Beacon with safety control orbit
 */
function PrivacyBeacon3D() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="safety-svg-art"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Amethyst / Violet Privacy Ring Gradient */}
        <linearGradient id="beaconViolet" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="45%" stopColor="#7e22ce" />
          <stop offset="85%" stopColor="#581c87" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>

        {/* Emerald Safe Core */}
        <radialGradient id="safeCore" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>

        {/* Glass Specular */}
        <linearGradient id="beaconHighlight" x1="60" y1="60" x2="180" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Floor Ambient Shadow */}
      <ellipse cx="120" cy="214" rx="60" ry="11" fill="#3b0764" fillOpacity="0.22" filter="blur(8px)" />

      {/* Outer 3D Sphere Capsule */}
      <circle cx="120" cy="115" r="76" fill="url(#beaconViolet)" stroke="#e9d5ff" strokeWidth="3" />

      {/* Top Glass Hemisphere Highlight */}
      <path
        d="M65 95
           C75 55, 165 55, 175 95
           C145 75, 95 75, 65 95 Z"
        fill="url(#beaconHighlight)"
      />

      {/* Inner Emerald Safe Core */}
      <circle cx="120" cy="115" r="44" fill="url(#safeCore)" stroke="#a7f3d0" strokeWidth="2.5" />

      {/* Stylized Privacy Shield / Eye Contour */}
      <path
        d="M92 115
           C102 96, 138 96, 148 115
           C138 134, 102 134, 92 115 Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Core Iris Center */}
      <circle cx="120" cy="115" r="11" fill="#064e3b" />
      <circle cx="123" cy="112" r="3.5" fill="#ffffff" />

      {/* 3D Orbit Ring around Sphere */}
      <ellipse
        cx="120"
        cy="115"
        rx="92"
        ry="28"
        transform="rotate(-22 120 115)"
        stroke="#f43f5e"
        strokeWidth="4"
        strokeDasharray="14 8"
        opacity="0.85"
      />
    </svg>
  );
}

/**
 * Dedicated Trust & Safety Section
 * Styled strictly with external CSS (.safety-*) - zero Tailwind & zero inline styles
 * High-performance IntersectionObserver animation triggers
 */
export function SafetyApproach({ className = "" }) {
  const { t } = useLanguage();

  // Intersection Observers for Header and Cards
  const [headerRef, isHeaderVisible] = useIntersectionObserver({
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
    freezeOnceVisible: true,
  });

  const [cardsRef, isCardsVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
    freezeOnceVisible: true,
  });

  const cards = [
    {
      id: "verification",
      tag: t("safety.c1_tag", "Biometric AI Verification"),
      title: t("safety.c1_title", "100% Genuine Profiles"),
      desc: t(
        "safety.c1_desc",
        "Our advanced selfie verification and live face recognition ensure you connect only with authentic individuals — keeping bots, fakes, and catfishes out."
      ),
      illustration: <PremShield3D />,
    },
    {
      id: "respect",
      tag: t("safety.c2_tag", "Proactive Moderation"),
      title: t("safety.c2_title", "Harassment-Free Space"),
      desc: t(
        "safety.c2_desc",
        "Smart on-device message filters and proactive safety guidelines automatically block unsolicited media and toxic behavior before it reaches you."
      ),
      illustration: <SafeChat3D />,
    },
    {
      id: "control",
      tag: t("safety.c3_tag", "Complete Privacy & Autonomy"),
      title: t("safety.c3_title", "You Set The Rules"),
      desc: t(
        "safety.c3_desc",
        "Stay completely in charge with Ghost Mode browsing, selective profile visibility, and 1-tap instant block & report tools anytime you need them."
      ),
      illustration: <PrivacyBeacon3D />,
    },
  ];

  return (
    <section className={`safety-section ${className}`}>
      <div className="safety-container">
        {/* Top Header Grid with Scroll-Reveal */}
        <div
          ref={headerRef}
          className={`safety-header-grid scroll-reveal ${
            isHeaderVisible ? "is-revealed" : ""
          }`}
        >
          <div className="safety-header-title-box">
            <span className="safety-badge">
              {t("safety.badge", "Trust & Safety at Prem Jodo")}
            </span>
            <h2 className="safety-title">
              {t("safety.title", "Your Safety & Trust Come First")}
            </h2>
          </div>

          <div className="safety-header-desc-box">
            <p className="safety-description">
              {t(
                "safety.subtitle",
                "From AI face verification and encrypted real-time chat to discrete privacy controls — every feature in Prem Jodo is designed so you can explore meaningful connections with complete confidence."
              )}
            </p>
          </div>
        </div>

        {/* 3 Column Feature Cards Grid with Staggered Scroll-Reveal */}
        <div ref={cardsRef} className="safety-cards-grid">
          {cards.map((card, index) => (
            <article
              key={card.id}
              className={`safety-card scroll-reveal stagger-${index + 1} ${
                isCardsVisible ? "is-revealed" : ""
              }`}
            >
              {/* Top Text Info */}
              <div className="safety-card-info">
                <span className="safety-card-tag">{card.tag}</span>
                <h3 className="safety-card-heading">{card.title}</h3>
                <p className="safety-card-text">{card.desc}</p>
              </div>

              {/* Bottom 3D Glossy Artwork */}
              <div className="safety-card-visual-wrap">
                {card.illustration}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Lightweight Zero-CLS Skeleton for Dynamic Code-Splitting
 */
export function SafetyApproachSkeleton() {
  return (
    <section className="safety-section safety-skeleton-wrap" aria-hidden="true">
      <div className="safety-container">
        <div className="safety-header-grid">
          <div className="safety-header-title-box">
            <div className="safety-skeleton-box safety-skeleton-badge" />
            <div className="safety-skeleton-box safety-skeleton-title" />
          </div>
          <div className="safety-header-desc-box">
            <div className="safety-skeleton-box safety-skeleton-desc-1" />
            <div className="safety-skeleton-box safety-skeleton-desc-2" />
          </div>
        </div>
        <div className="safety-cards-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="safety-skeleton-card-item">
              <div>
                <div className="safety-skeleton-box safety-skeleton-card-tag" />
                <div className="safety-skeleton-box safety-skeleton-card-title" />
                <div className="safety-skeleton-box safety-skeleton-card-desc-1" />
                <div className="safety-skeleton-box safety-skeleton-card-desc-2" />
              </div>
              <div className="safety-skeleton-art-wrap">
                <div className="safety-skeleton-box safety-skeleton-art-circle" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SafetyApproach;
