"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import "@/styles/safety.css";

import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserCheck,
  EyeOff,
  Bell,
  PhoneCall,
  HeartHandshake,
} from "lucide-react";

// Code-splitting AuthModal
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

export default function SafetyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Intersection observers for section animations
  const [heroRef, isHeroVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 100px 0px",
    freezeOnceVisible: true,
  });

  const [pillarsRef, isPillarsVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const [rulesRef, isRulesVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  const safetyPillars = [
    {
      title: t("safetyPage.p1_title"),
      icon: UserCheck,
      desc: t("safetyPage.p1_desc"),
    },
    {
      title: t("safetyPage.p2_title"),
      icon: Lock,
      desc: t("safetyPage.p2_desc"),
    },
    {
      title: t("safetyPage.p3_title"),
      icon: EyeOff,
      desc: t("safetyPage.p3_desc"),
    },
    {
      title: t("safetyPage.p4_title"),
      icon: Bell,
      desc: t("safetyPage.p4_desc"),
    },
  ];

  return (
    <div className="safety-page-root">
      <Navbar onOpenAuth={openAuth} />

      <main className="safety-page-main">
        {/* Hero */}
        <section className="safety-hero-section">
          <div
            ref={heroRef}
            className={`safety-hero-inner scroll-reveal ${
              isHeroVisible ? "is-revealed" : ""
            }`}
          >
            <h1 className="safety-hero-title">
              {t("safetyPage.titlePrefix")}
              <span className="safety-title-gradient">
                {t("safetyPage.titleHighlight")}
              </span>
            </h1>
            <p className="safety-hero-subtitle">
              {t("safetyPage.subtitle")}
            </p>
          </div>
        </section>

        {/* 4 Pillars of Safety */}
        <section className="safety-pillars-section">
          <div className="container">
            <div className="safety-pillars-header">
              <h2 className="safety-section-heading">
                {t("safetyPage.headingProtect")}
              </h2>
            </div>

            <div
              ref={pillarsRef}
              className={`safety-pillars-grid scroll-reveal ${
                isPillarsVisible ? "is-revealed" : ""
              }`}
            >
              {safetyPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <article key={idx} className="safety-pillar-card">
                    <div className="safety-pillar-icon-box">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="safety-pillar-content">
                      <h3 className="safety-pillar-title">{item.title}</h3>
                      <p className="safety-pillar-desc">{item.desc}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real-World Meetup Safety Rules */}
        <section className="safety-rules-section">
          <div className="container">
            <div className="safety-rules-header">
              <h2 className="safety-section-heading">
                {t("safetyPage.rulesHeading")}
              </h2>
              <p className="safety-rules-subtitle">
                {t("safetyPage.rulesSub")}
              </p>
            </div>

            <div
              ref={rulesRef}
              className={`safety-rules-grid scroll-reveal ${
                isRulesVisible ? "is-revealed" : ""
              }`}
            >
              <div className="safety-rule-card">
                <div className="safety-rule-title-box color-rose">
                  <HeartHandshake className="w-5 h-5" />
                  <span>{t("safetyPage.r1_title")}</span>
                </div>
                <p className="safety-rule-desc">{t("safetyPage.r1_desc")}</p>
              </div>

              <div className="safety-rule-card">
                <div className="safety-rule-title-box color-amber">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t("safetyPage.r2_title")}</span>
                </div>
                <p className="safety-rule-desc">{t("safetyPage.r2_desc")}</p>
              </div>

              <div className="safety-rule-card">
                <div className="safety-rule-title-box color-rose">
                  <UserCheck className="w-5 h-5" />
                  <span>{t("safetyPage.r3_title")}</span>
                </div>
                <p className="safety-rule-desc">{t("safetyPage.r3_desc")}</p>
              </div>

              <div className="safety-rule-card">
                <div className="safety-rule-title-box color-purple">
                  <PhoneCall className="w-5 h-5" />
                  <span>{t("safetyPage.r4_title")}</span>
                </div>
                <p className="safety-rule-desc">{t("safetyPage.r4_desc")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode="register"
        />
      )}
    </div>
  );
}
