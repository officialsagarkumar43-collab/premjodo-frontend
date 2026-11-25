"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/common/utils";

/**
 * Prem Jodo Official Icon Mark (PNG Image)
 */
export function LogoMark({ className, size = 32 }) {
  const height = size;
  const width = Math.round(size * (249 / 313));

  return (
    <img
      src="/images/logo-mark.png"
      alt="Prem Jodo Mark"
      width={width}
      height={height}
      className={cn("select-none object-contain shrink-0", className)}
      style={{
        height: `${height}px`,
        width: "auto",
        display: "inline-block",
        transform: "none",
      }}
      loading="eager"
      decoding="async"
    />
  );
}

/**
 * Prem Jodo Official Logo Component (PNG Image)
 * Uses high-resolution PNG image with transparent background.
 */
export function Logo({
  className,
  size = "md",
  href = "/",
  variant = "auto",
  showWordmark = true,
}) {
  const sizeMap = {
    xs: { height: 28, width: 141, markWidth: 22 },
    sm: { height: 34, width: 171, markWidth: 27 },
    md: { height: 40, width: 201, markWidth: 32 },
    lg: { height: 48, width: 241, markWidth: 38 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const imageSrc = showWordmark ? "/images/logo.png" : "/images/logo-mark.png";
  const imageWidth = showWordmark ? currentSize.width : currentSize.markWidth;

  const content = (
    <div
      className={cn(
        "brand-logo-wrap select-none notranslate skiptranslate inline-flex items-center",
        className
      )}
      translate="no"
    >
      <img
        src={imageSrc}
        alt="Prem Jodo"
        width={imageWidth}
        height={currentSize.height}
        className="brand-logo-img site-logo-img select-none object-contain"
        style={{
          height: `${currentSize.height}px`,
          width: "auto",
          maxWidth: "none",
          display: "block",
          transform: "none",
        }}
        loading="eager"
        decoding="async"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Prem Jodo Home">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
