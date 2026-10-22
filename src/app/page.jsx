"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import { SafetyApproachSkeleton } from "@/components/reusable";
import "@/styles/home.css";

// 1. Code-splitting: Defer heavy AuthModal chunk until opened by user action
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

// 2. Code-splitting: Defer below-the-fold Trust & Safety component with zero-CLS skeleton
const SafetyApproach = dynamic(
  () => import("@/components/reusable/SafetyApproach").then((m) => m.SafetyApproach),
  {
    ssr: true,
    loading: () => <SafetyApproachSkeleton />,
  }
);

// 3. Code-splitting: Preloader overlay
const Preloader = dynamic(
  () => import("@/components/reusable/Preloader").then((m) => m.Preloader),
  { ssr: false }
);

const ROTATING_WORDS = ["swipe.", "match.", "spark.", "connect."];

export default function PremJodoLandingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, refreshSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [wordIndex, setWordIndex] = useState(0);

  // Intersection Observer for Hero quote and call-to-action
  const [quoteRef, isQuoteVisible] = useIntersectionObserver({
    threshold: 0.15,
    rootMargin: "0px 0px -30px 0px",
    freezeOnceVisible: true,
  });

  // 3D Rotating hero words animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Smooth preloader transition on mount & refresh active subscription
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscription();
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [isAuthenticated, refreshSubscription]);

  const openAuth = (mode = "register") => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="landing-page-root">
      {/* Code-split Preloader */}
      {isLoading && <Preloader fullScreen={true} />}

      <Navbar onOpenAuth={openAuth} />

      <main className="landing-main-content">
        {/* Hero Section */}
        <section className="hero-section">
          {/* Hardware-accelerated ambient glow */}
          <div className="hero-glow-aura" aria-hidden="true" />

          <div className="hero-container">
            {/* Main Title with 3D Flip & Shimmer Animations */}
            <h1 className="hero-heading">
              <span className="hero-prefix-text">
                {t("hero.titlePrefix", "It starts with a ")}
              </span>
              <span className="hero-word-wrap">
                <span key={wordIndex} className="hero-word-animated">
                  {ROTATING_WORDS[wordIndex]}
                </span>
                <span className="hero-trademark-symbol">™</span>
              </span>
            </h1>

            {/* Interactive CTA Buttons Group */}
            <div className="hero-cta-group">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/user"
                    className="hero-btn hero-btn-primary"
                  >
                    <span>Explore Matches</span>
                    <ArrowRight className="hero-btn-arrow" />
                  </Link>
                  <Link
                    href="/user/profile"
                    className="hero-btn hero-btn-secondary"
                  >
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="hero-btn hero-btn-secondary"
                  >
                    {t("hero.getApp")}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="hero-btn hero-btn-primary"
                  >
                    {t("hero.createAccount")}
                  </button>
                </>
              )}
            </div>

            {/* Subtext Quote with IntersectionObserver entrance */}
            <div
              ref={quoteRef}
              className={`hero-quote-box scroll-reveal ${
                isQuoteVisible ? "is-revealed" : ""
              }`}
            >
              <p className="hero-quote-text">{t("hero.quote")}</p>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="hero-quote-action"
              >
                {t("hero.findOutWho")}
              </button>
            </div>
          </div>
        </section>

        {/* Dedicated Trust & Safety Section (Code-Split & Intersection Observer animated) */}
        <SafetyApproach />
      </main>

      <Footer />

      {/* Interactive Auth Modal (Code-split: loaded only upon user click) */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode={authMode}
        />
      )}
    </div>
  );
}
