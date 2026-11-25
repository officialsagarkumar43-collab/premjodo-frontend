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
        {/* Pagehead */}
        <section className="pagehead">
          <div className="wrap">
            <span className="pill">SAFETY & PRIVACY</span>
            <h1>Date with confidence.</h1>
            <p>
              Your comfort matters. Explore the controls designed to help you shape a safer, more private experience.
            </p>
          </div>
        </section>

        {/* 6 Safety & Privacy Cards */}
        <section className="section">
          <div className="wrap">
            <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              <article className="card">
                <div className="icon">✓</div>
                <h3>Selfie verification</h3>
                <p>Verification features can help members build confidence that profiles represent real people.</p>
              </article>

              <article className="card">
                <div className="icon">◉</div>
                <h3>Ghost Mode</h3>
                <p>Browse with greater discretion and choose when your profile is visible.</p>
              </article>

              <article className="card">
                <div className="icon">⊘</div>
                <h3>Block & report</h3>
                <p>Use quick controls to block or report behaviour that makes you uncomfortable.</p>
              </article>

              <article className="card">
                <div className="icon">⌑</div>
                <h3>Selective visibility</h3>
                <p>Keep control over how your profile is presented and who can discover you.</p>
              </article>

              <article className="card">
                <div className="icon">♢</div>
                <h3>Clear intentions</h3>
                <p>Set expectations early to connect with people on a similar wavelength.</p>
              </article>

              <article className="card">
                <div className="icon">🔒</div>
                <h3>Privacy protection</h3>
                <p>Your contact details and sensitive information stay protected by design.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Safety Guidelines Band */}
        <section className="band">
          <div className="wrap split">
            <div>
              <div className="eyebrow" style={{ color: "#f3b9ca" }}>Real-World Safety</div>
              <h2>Meet safely in public spaces.</h2>
              <p>
                Always arrange initial dates in well-lit public spots, arrange your own transportation, and inform a friend or family member.
              </p>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="btn"
              >
                Join Safe Community
              </button>
            </div>
            <div className="mock-photo" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522543558187-768b6df7c25c?auto=format&fit=crop&w=1000&q=85')" }} />
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
