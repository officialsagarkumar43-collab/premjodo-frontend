"use client";

import React from "react";
import { HeartHandshake, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./FeatureCards.module.css";

const iconMap = {
  HeartHandshake: HeartHandshake,
  Shield: Shield,
  ShieldCheck: ShieldCheck,
  Sparkles: Sparkles,
};

export function FeatureCards({
  cards = [],
  onCardClick,
  className = "",
  sectionClassName = "",
}) {
  const { t } = useLanguage();

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.featureSection} ${sectionClassName}`}>
      <div className={`${styles.featureContainer} ${className}`}>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("features.badge", "Top Features")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight mb-4">
            {t("features.titlePrefix", "Explore Our ")}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              {t("features.titleHighlight", "Top Features")}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t(
              "features.subtitle",
              "Discover compatibility-first matchmaking, 100% verified selfie profiles, and safe in-app interactions."
            )}
          </p>
        </div>

        <div className={styles.featureGrid}>
          {cards.map((card) => {
            const IconComponent = iconMap[card.iconName] || HeartHandshake;
            const title = t(card.titleKey, card.fallbackTitle || "");
            const description = t(card.descKey, card.fallbackDesc || "");

            return (
              <div
                key={card.id}
                className={`${styles.card} ${card.borderHover || ""}`}
              >
                {card.image ? (
                  <div className={styles.imageWrapper}>
                    <img
                      src={card.image}
                      alt={card.imageAlt || title}
                      className={styles.featureImage}
                      loading="lazy"
                      width={400}
                      height={260}
                    />
                  </div>
                ) : (
                  <div className={`${styles.iconWrapper} ${card.iconBg || ""}`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                )}

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <p className={styles.cardDescription}>{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
