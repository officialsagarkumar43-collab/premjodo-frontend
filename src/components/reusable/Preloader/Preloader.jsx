"use client";

import React from "react";
import { HeartHandshake } from "lucide-react";
import styles from "./Preloader.module.css";

export function Preloader({
  fullScreen = true,
  text = null,
  showBrand = true,
  className = "",
}) {
  const content = (
    <div className={`${styles.loaderContent} ${className}`}>
      {/* Animated Glowing Heart Badge */}
      <div className={styles.glowAura}>
        <div className={styles.glowRing} />
        <div className={styles.orbitRing} />
        <div className={styles.heartIconBox}>
          <HeartHandshake className="w-8 h-8 stroke-[2.2]" />
        </div>
      </div>

      {/* Brand Typography */}
      {showBrand && (
        <h2 className={styles.brandName}>
          Prem<span className={styles.brandHighlight}>Jodo</span>
        </h2>
      )}

      {/* Optional Subtitle Message */}
      {text && <p className={styles.messageText}>{text}</p>}

      {/* Animated Gradient Dots */}
      <div className={styles.dotsWrapper}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={styles.preloaderOverlay}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={styles.inlineContainer}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {content}
    </div>
  );
}
