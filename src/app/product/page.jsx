"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import "@/styles/product.css";

import {
  Sparkles,
  Heart,
  ShieldCheck,
  MessageCircle,
  Video,
  Lock,
  Compass,
  ArrowRight,
} from "lucide-react";

// Code-splitting AuthModal
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

export default function ProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Intersection observers for hero, features, and stats
  const [heroRef, isHeroVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 100px 0px",
    freezeOnceVisible: true,
  });

  const [featuresRef, isFeaturesVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const [statsRef, isStatsVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 150px 0px",
    freezeOnceVisible: true,
  });

  const openAuth = (mode = "register") => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  const productFeatures = [
    {
      title: t("productPage.f1_title"),
      tagline: t("productPage.f1_tag"),
      description: t("productPage.f1_desc"),
      icon: Heart,
      iconClass: "product-icon-rose",
    },
    {
      title: t("productPage.f2_title"),
      tagline: t("productPage.f2_tag"),
      description: t("productPage.f2_desc"),
      icon: ShieldCheck,
      iconClass: "product-icon-emerald",
    },
    {
      title: t("productPage.f3_title"),
      tagline: t("productPage.f3_tag"),
      description: t("productPage.f3_desc"),
      icon: MessageCircle,
      iconClass: "product-icon-purple",
    },
    {
      title: t("productPage.f4_title"),
      tagline: t("productPage.f4_tag"),
      description: t("productPage.f4_desc"),
      icon: Video,
      iconClass: "product-icon-amber",
    },
    {
      title: t("productPage.f5_title"),
      tagline: t("productPage.f5_tag"),
      description: t("productPage.f5_desc"),
      icon: Lock,
      iconClass: "product-icon-sky",
    },
    {
      title: t("productPage.f6_title"),
      tagline: t("productPage.f6_tag"),
      description: t("productPage.f6_desc"),
      icon: Compass,
      iconClass: "product-icon-pink",
    },
  ];

  return (
    <div className="product-page-root">
      <Navbar onOpenAuth={openAuth} />

      <main className="product-page-main">
        {/* Hero Section */}
        <section className="product-hero-section">
          <div
            ref={heroRef}
            className={`product-hero-inner scroll-reveal ${
              isHeroVisible ? "is-revealed" : ""
            }`}
          >
            <h1 className="product-hero-title">
              {t("productPage.titlePrefix")}
              <span className="product-title-gradient">
                {t("productPage.titleHighlight")}
              </span>
            </h1>
            <p className="product-hero-subtitle">
              {t("productPage.subtitle")}
            </p>

            <div className="product-hero-cta-wrap">
              {isAuthenticated ? (
                <Link
                  href="/user"
                  className="product-hero-cta-btn"
                >
                  <span>Explore Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="product-hero-cta-btn"
                >
                  {t("productPage.joinCta")}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="product-features-section">
          <div className="container">
            <div
              ref={featuresRef}
              className={`product-features-grid scroll-reveal ${
                isFeaturesVisible ? "is-revealed" : ""
              }`}
            >
              {productFeatures.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <article key={index} className="product-feature-card">
                    <div>
                      <div className={`product-feature-icon-box ${feat.iconClass}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="product-feature-title">
                        {feat.title}
                      </h3>
                      <p className="product-feature-tagline">
                        {feat.tagline}
                      </p>
                      <p className="product-feature-desc">
                        {feat.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="product-stats-section">
          <div className="container">
            <div
              ref={statsRef}
              className={`product-stats-grid scroll-reveal ${
                isStatsVisible ? "is-revealed" : ""
              }`}
            >
              <div>
                <p className="product-stat-number product-stat-color-rose">0%</p>
                <p className="product-stat-label">{t("productPage.statSecurity", "Fake Profiles & Bots")}</p>
              </div>
              <div>
                <p className="product-stat-number product-stat-color-amber">100%</p>
                <p className="product-stat-label">{t("productPage.statVerified", "Selfie Verified")}</p>
              </div>
              <div>
                <p className="product-stat-number product-stat-color-pink">24/7</p>
                <p className="product-stat-label">{t("productPage.statSupport", "Safety & Support Desk")}</p>
              </div>
              <div>
                <p className="product-stat-number product-stat-color-emerald">50+</p>
                <p className="product-stat-label">{t("productPage.statCities", "Indian Cities")}</p>
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
