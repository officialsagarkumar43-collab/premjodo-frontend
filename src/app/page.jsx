"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import { Preloader, SafetyApproach } from "@/components/reusable";
import "@/styles/home.css";

// Code-splitting: Defer heavy AuthModal chunk until opened by user action
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

const ROTATING_WORDS = ["swipe.", "match.", "spark.", "connect."];

export default function PremJodoLandingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading, refreshSubscription } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [wordIndex, setWordIndex] = useState(0);
  const refreshedRef = useRef(false);

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

  // Refresh active subscription when authenticated
  useEffect(() => {
    if (isAuthenticated && !refreshedRef.current) {
      refreshedRef.current = true;
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  // Smooth, flicker-free preloader lifecycle:
  // Renders immediately with initial SSR HTML, waits for auth readiness (or min display time),
  // then performs a silky 450ms fade-out transition before unmounting.
  useEffect(() => {
    let unmountTimer;

    const startExit = () => {
      setIsExiting(true);
      unmountTimer = setTimeout(() => {
        setShowPreloader(false);
      }, 450);
    };

    const minDisplayMs = 500;
    const maxFallbackMs = 900;
    const startTime = Date.now();

    let readyTimer = null;

    if (!authLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      readyTimer = setTimeout(startExit, remaining);
    }

    // Safety fallback so page always appears even if auth network request stalls
    const fallbackTimer = setTimeout(() => {
      startExit();
    }, maxFallbackMs);

    return () => {
      if (readyTimer) clearTimeout(readyTimer);
      clearTimeout(fallbackTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, [authLoading]);

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
      {/* Full-screen initial preloader with silky fade-out exit */}
      {showPreloader && <Preloader fullScreen={true} isExiting={isExiting} />}

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
              </span>
            </h1>

            {/* Interactive CTA Buttons Group */}
            <div className="hero-cta-group">
              {authLoading ? (
                // Smooth placeholder during initial auth sync behind preloader
                <div style={{ minHeight: "48px" }} aria-hidden="true" />
              ) : isAuthenticated ? (
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

        {/* Dedicated Trust & Safety Section */}
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
