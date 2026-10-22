"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import "@/styles/download.css";

import {
  Download,
  QrCode,
  Smartphone,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Code-splitting AuthModal
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

export default function DownloadPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Intersection Observers for smooth scroll reveal
  const [heroRef, isHeroVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  const [boxRef, isBoxVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  return (
    <div className="download-page-root">
      <Navbar onOpenAuth={openAuth} />

      <main className="download-page-main">
        {/* Hero */}
        <section className="download-hero-section">
          <div
            ref={heroRef}
            className={`download-hero-inner scroll-reveal ${
              isHeroVisible ? "is-revealed" : ""
            }`}
          >
            <h1 className="download-hero-title">
              {t("downloadPage.titlePrefix")}
              <span className="download-title-gradient">
                {t("downloadPage.titleHighlight")}
              </span>
            </h1>
            <p className="download-hero-subtitle">
              {t("downloadPage.subtitle")}
            </p>
          </div>
        </section>

        {/* Download Box */}
        <section className="download-box-section">
          <div className="container">
            <div
              ref={boxRef}
              className={`download-box-card scroll-reveal ${
                isBoxVisible ? "is-revealed" : ""
              }`}
            >
              {/* Coming Soon Glassmorphism Overlay */}
              <div className="download-coming-soon-overlay">
                <div className="download-badge-soon">
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  <span>Coming Soon</span>
                </div>

                <div>
                  <h3 className="download-overlay-title">
                    Mobile Apps Launching Soon!
                  </h3>
                  <p className="download-overlay-desc">
                    Our iOS and Android native apps are currently in final verification. You can continue using Prem Jodo seamlessly via mobile and web browser!
                  </p>
                </div>

                <div className="download-store-pills">
                  <div className="download-store-pill">
                    <Smartphone className="w-4 h-4 text-rose-400" />
                    <span>Google Play Store</span>
                  </div>
                  <div className="download-store-pill">
                    <Smartphone className="w-4 h-4 text-pink-400" />
                    <span>Apple App Store</span>
                  </div>
                </div>
              </div>

              {/* Glow background */}
              <div className="download-box-glow" aria-hidden="true" />

              {/* Left QR Code Container */}
              <div className="download-qr-wrap">
                <div className="download-qr-box">
                  <div className="download-qr-inner">
                    <QrCode className="w-20 h-20 text-zinc-900" />
                    <span className="download-qr-label">
                      {t("downloadPage.scanText")}
                    </span>
                  </div>
                </div>
                <p className="download-qr-hint">
                  {t("downloadPage.scanHint")}
                </p>
              </div>

              {/* Right Download Buttons & Highlights */}
              <div className="download-info-wrap">
                <div>
                  <span className="download-info-version">
                    {t("downloadPage.appVersion")}
                  </span>
                  <h2 className="download-info-heading">
                    {t("downloadPage.ctaHeading")}
                  </h2>
                  <div className="download-info-stats">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> 4.8 / 5.0
                    </span>
                    <span>•</span>
                    <span>Free Install</span>
                  </div>
                </div>

                <div className="download-features-list">
                  <div className="download-feature-row">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t("downloadPage.h1")}</span>
                  </div>
                  <div className="download-feature-row">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t("downloadPage.h2")}</span>
                  </div>
                  <div className="download-feature-row">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t("downloadPage.h3")}</span>
                  </div>
                </div>

                <div className="download-btn-group">
                  <button
                    type="button"
                    onClick={openAuth}
                    className="download-btn-white"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{t("downloadPage.googlePlay")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAuth}
                    className="download-btn-dark"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{t("downloadPage.appStore")}</span>
                  </button>
                </div>

                <p className="download-terms-note">
                  By downloading, you agree to Prem Jodo <a href="/terms">Terms</a> &amp; <a href="/privacy">Privacy Policy</a>. Strictly for users aged 18+.
                </p>
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
