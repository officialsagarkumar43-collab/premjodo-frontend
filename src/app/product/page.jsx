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
        {/* Pagehead Matching Redesign Preview */}
        <section className="pagehead">
          <div className="wrap">
            <span className="pill">THE PREM JODO EXPERIENCE</span>
            <h1>Connection, without the noise.</h1>
            <p>
              Thoughtful discovery, meaningful conversations and tools that let you date at your own pace.
            </p>
          </div>
        </section>

        {/* Split Section: Discover, Connect, Choose */}
        <section className="section">
          <div className="wrap split">
            <div className="mock-photo" />
            <div>
              <div className="eyebrow">01 · Discover</div>
              <h2 style={{ font: "700 36px 'Playfair Display', Georgia, serif", margin: "10px 0 14px", color: "var(--ink)" }}>
                Meet beyond the profile.
              </h2>
              <p className="lead" style={{ marginBottom: "26px" }}>
                Explore people, interests and intentions. Start with curiosity and let a conversation grow naturally.
              </p>

              <div className="eyebrow">02 · Connect</div>
              <h2 style={{ font: "700 30px 'Playfair Display', Georgia, serif", margin: "10px 0 14px", color: "var(--ink)" }}>
                Make space for a spark.
              </h2>
              <p className="lead" style={{ marginBottom: "26px" }}>
                Move from introductions to conversations with clarity and confidence.
              </p>

              <div className="eyebrow">03 · Choose</div>
              <h2 style={{ font: "700 30px 'Playfair Display', Georgia, serif", margin: "10px 0 14px", color: "var(--ink)" }}>
                Your experience, your rules.
              </h2>
              <p className="lead">
                Manage visibility and privacy settings to feel comfortable at every step.
              </p>

              <div style={{ marginTop: "32px" }}>
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
                    Join Prem Jodo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Designed around you - 3 Cards */}
        <section className="section" style={{ background: "var(--cream)" }}>
          <div className="wrap center">
            <h2>Designed around you</h2>
            <p className="sub">
              Everything in Prem Jodo is designed with empathy, security, and true human connection.
            </p>
            <div className="cards">
              <article className="card">
                <div className="icon">♡</div>
                <h3>Personal discovery</h3>
                <p>Explore profiles at your own pace with genuine intentions.</p>
              </article>
              <article className="card">
                <div className="icon">✉</div>
                <h3>Better conversations</h3>
                <p>Make room for authentic introductions without unwanted distractions.</p>
              </article>
              <article className="card">
                <div className="icon">⌑</div>
                <h3>Privacy controls</h3>
                <p>Choose what feels right to share with full selective visibility.</p>
              </article>
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
