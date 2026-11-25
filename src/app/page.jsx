"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { HeroConversationPreview } from "@/components/common/HeroConversationPreview";
import { ArrowRight, ShieldCheck, Lock, Sparkles, MessageCircle } from "lucide-react";
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
  const refreshedRef = useRef(false);

  // Refresh active subscription when authenticated
  useEffect(() => {
    if (isAuthenticated && !refreshedRef.current) {
      refreshedRef.current = true;
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  // Smooth preloader lifecycle
  useEffect(() => {
    let unmountTimer;

    const startExit = () => {
      setIsExiting(true);
      unmountTimer = setTimeout(() => {
        setShowPreloader(false);
      }, 450);
    };

    const minDisplayMs = 400;
    const maxFallbackMs = 800;
    const startTime = Date.now();
    let readyTimer = null;

    if (!authLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      readyTimer = setTimeout(startExit, remaining);
    }

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
      {/* Full-screen initial preloader */}
      {showPreloader && <Preloader fullScreen={true} isExiting={isExiting} />}

      <Navbar onOpenAuth={openAuth} />

      <main className="landing-main-content">
        {/* Redesign Preview Hero Section */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow">{t("hero.eyebrow", "A better way to connect")}</div>
              <h1>
                Real people.<br />
                <em>Meaningful</em><br />
                connections.
              </h1>
              <p className="lead">
                {t(
                  "hero.lead",
                  "Dating should feel exciting, safe and genuinely you. Discover thoughtful connections with privacy-first features built around your comfort."
                )}
              </p>

              <div className="actions">
                {isAuthenticated ? (
                  <Link href="/user" className="btn">
                    Explore matches →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="btn"
                  >
                    Find your connection →
                  </button>
                )}
                <Link href="/text-chat" className="btn light">
                  <MessageCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  Start Chat
                </Link>
              </div>

              <div className="note">
                ✦ Verified profiles · Privacy-first · You’re in control
              </div>
            </div>

            {/* Hero Interactive Live Video Call & Chat Conversation Preview */}
            <HeroConversationPreview onOpenAuth={openAuth} />
          </div>
        </section>

        {/* Section 2: Connection with intention (3 Cards) */}
        <section className="section">
          <div className="wrap center">
            <div className="eyebrow">Connection with intention</div>
            <h2>
              More than a swipe.<br />
              A better first step.
            </h2>
            <p className="sub">
              A thoughtful dating experience puts people, privacy and genuine discovery first.
            </p>

            <div className="cards">
              <article className="card">
                <div className="icon">♡</div>
                <h3>Discover naturally</h3>
                <p>Explore profiles and find people whose interests and intentions feel aligned.</p>
              </article>

              <article className="card">
                <div className="icon">✓</div>
                <h3>Feel more confident</h3>
                <p>Verification features help create a more trustworthy community experience.</p>
              </article>

              <article className="card">
                <div className="icon">⌑</div>
                <h3>Stay in control</h3>
                <p>Privacy settings, selective visibility and easy block/report tools put you first.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Section 3: Wine Brand Story Band */}
        <section className="band">
          <div className="wrap split">
            <div>
              <div className="eyebrow" style={{ color: "#f3b9ca" }}>
                Your story starts here
              </div>
              <h2>
                Make the first move<br />
                feel like you.
              </h2>
              <p>
                Take your time, show up authentically and discover connections that could mean something.
              </p>
              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="btn"
                >
                  Get started
                </button>
              </div>
            </div>
            {/* Moving romantic image composition */}
            <div className="romantic-motion-wrap">
              <div
                className="romantic-main-card"
                style={{
                  backgroundImage: "url('/images/story-sunset-silhouette.jpg')",
                }}
              />
            </div>
          </div>
        </section>

        {/* Section 4: A little more peace of mind */}
        <section className="section center">
          <div className="wrap">
            <div className="eyebrow">A little more peace of mind</div>
            <h2>Your comfort comes first.</h2>
            <p className="sub">
              From Ghost Mode browsing to one-tap block and report, Prem Jodo is designed to give you more choice over your dating experience.
            </p>
            <div style={{ marginTop: "28px" }}>
              <Link className="btn" href="/safety">
                Explore safety features →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Interactive Auth Modal */}
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
