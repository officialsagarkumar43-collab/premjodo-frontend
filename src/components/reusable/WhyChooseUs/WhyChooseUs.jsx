"use client";

import React from "react";
import {
  ShieldCheck,
  HeartHandshake,
  Lock,
  PhoneCall,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function WhyChooseUs({ onAction, className = "" }) {
  const { t } = useLanguage();

  const reasons = [
    {
      id: "r1",
      icon: ShieldCheck,
      image: "/images/features/why-selfie-verification.jpg",
      title: t("whyChooseUs.f1_title", "AI Selfie Verification"),
      badge: t("whyChooseUs.f1_badge", "Zero Fake Profiles"),
      desc: t(
        "whyChooseUs.f1_desc",
        "100% authentic members with 3D facial liveness check. Zero fake profiles, bots, or impersonators."
      ),
      accent: "rose",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-500/10 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
      borderHover: "hover:border-rose-300 dark:hover:border-rose-600/40",
    },
    {
      id: "r2",
      icon: HeartHandshake,
      image: "/images/features/why-compatibility.jpg",
      title: t("whyChooseUs.f2_title", "Value-First Compatibility"),
      badge: t("whyChooseUs.f2_badge", "Smart Algorithm"),
      desc: t(
        "whyChooseUs.f2_desc",
        "Smart matchmaking algorithms that pair you on core life values, relationship goals, and personality."
      ),
      accent: "pink",
      iconBg: "bg-pink-50 text-pink-600 border border-pink-100 shadow-sm shadow-pink-500/10 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/20",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40",
      borderHover: "hover:border-pink-300 dark:hover:border-pink-600/40",
    },
    {
      id: "r3",
      icon: Lock,
      image: "/images/features/why-privacy-control.jpg",
      title: t("whyChooseUs.f3_title", "Complete Privacy Control"),
      badge: t("whyChooseUs.f3_badge", "Privacy First"),
      desc: t(
        "whyChooseUs.f3_desc",
        "Incognito mode, blurred photo controls, and screenshot protection keep your identity confidential."
      ),
      accent: "indigo",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/10 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40",
      borderHover: "hover:border-indigo-300 dark:hover:border-indigo-600/40",
    },
    {
      id: "r4",
      icon: PhoneCall,
      image: "/images/features/why-safe-chats.jpg",
      title: t("whyChooseUs.f4_title", "Safe In-App Calls & Chats"),
      badge: t("whyChooseUs.f4_badge", "End-to-End Encrypted"),
      desc: t(
        "whyChooseUs.f4_desc",
        "Connect over encrypted audio & video calls within the app without ever sharing your phone number."
      ),
      accent: "amber",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-500/10 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
      borderHover: "hover:border-amber-300 dark:hover:border-amber-600/40",
    },
    {
      id: "r5",
      icon: Users,
      image: "/images/features/why-community-mixers.jpg",
      title: t("whyChooseUs.f5_title", "Real-World Community Mixers"),
      badge: t("whyChooseUs.f5_badge", "Online to Offline"),
      desc: t(
        "whyChooseUs.f5_desc",
        "Attend verified community mixers, cultural gatherings, and interactive meetups across top Indian cities."
      ),
      accent: "emerald",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
      borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/40",
    },
    {
      id: "r6",
      icon: Sparkles,
      image: "/images/features/why-moderation-support.jpg",
      title: t("whyChooseUs.f6_title", "24/7 Human & AI Moderation"),
      badge: t("whyChooseUs.f6_badge", "24/7 Support"),
      desc: t(
        "whyChooseUs.f6_desc",
        "Dedicated safety team ensuring rapid response, strict anti-harassment policies, and zero spam tolerance."
      ),
      accent: "violet",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100 shadow-sm shadow-purple-500/10 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
      borderHover: "hover:border-purple-300 dark:hover:border-purple-600/40",
    },
  ];

  const stats = [
    {
      value: t("whyChooseUs.stat1_value", "100%"),
      label: t("whyChooseUs.stat1_label", "Selfie Verified Profiles"),
    },
    {
      value: t("whyChooseUs.stat2_value", "0%"),
      label: t("whyChooseUs.stat2_label", "Fake Profiles & Bots"),
    },
    {
      value: t("whyChooseUs.stat3_value", "15 Mins"),
      label: t("whyChooseUs.stat3_label", "Avg Safety Response"),
    },
    {
      value: t("whyChooseUs.stat4_value", "24/7"),
      label: t("whyChooseUs.stat4_label", "Safety & Support Desk"),
    },
  ];

  return (
    <section className={`py-20 sm:py-28 relative overflow-hidden transition-colors ${className}`}>
      {/* Background Decorative Accents */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("whyChooseUs.badge", "Why Choose Prem Jodo")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight mb-5">
            {t("whyChooseUs.titlePrefix", "Designed For Trust, Built For ")}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              {t("whyChooseUs.titleHighlight", "Real Connections")}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t(
              "whyChooseUs.subtitle",
              "Experience a secure, authentic matchmaking community built on verified profiles, mutual values, and meaningful compatibility."
            )}
          </p>
        </div>

        {/* Reason Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-zinc-200/60 dark:hover:shadow-rose-950/20 text-center flex flex-col items-stretch overflow-hidden ${item.borderHover}`}
              >
                {/* Full-width Edge-to-Edge Image Header with centered framing */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-zinc-100 dark:bg-zinc-800/80">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-106"
                  />
                </div>

                {/* Card Title & Content */}
                <div className="p-6 sm:p-7 flex flex-col items-center flex-1 text-center">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats & Trust Bar */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-amber-50/50 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-900/90 border border-rose-100 dark:border-zinc-800 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-rose-200/50 dark:divide-zinc-800">
            {stats.map((stat, idx) => (
              <div key={idx} className={`${idx > 0 ? "pt-4 md:pt-0" : ""}`}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick CTA Banner */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50/70 to-amber-50 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/90 border border-rose-200/80 dark:border-zinc-800 shadow-xl shadow-rose-500/5 dark:shadow-none transition-all">
          <div className="text-left space-y-1">
            <h4 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              {t("whyChooseUs.ctaHeading", "Ready to find someone truly compatible?")}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t(
                "whyChooseUs.ctaSub",
                "Create your verified profile in less than 2 minutes and start connecting with genuine members."
              )}
            </p>
          </div>

          <button
            onClick={() => onAction && onAction()}
            className="w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:opacity-95 shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t("whyChooseUs.ctaBtn", "Get Started Free")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
