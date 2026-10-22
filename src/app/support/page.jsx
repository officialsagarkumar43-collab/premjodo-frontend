"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import "@/styles/support.css";

import {
  CreditCard,
  Camera,
  Plus,
  Minus,
  LifeBuoy,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

// Code-splitting AuthModal and CustomSelect
const AuthModal = dynamic(
  () => import("@/components/common/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

const CustomSelect = dynamic(
  () => import("@/components/reusable/CustomSelect").then((m) => m.CustomSelect),
  { ssr: false }
);

export default function SupportPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Intersection observers for hero and content grid
  const [heroRef, isHeroVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px 0px 100px 0px",
    freezeOnceVisible: true,
  });

  const [contentRef, isContentVisible] = useIntersectionObserver({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", topic: "general", message: "" });
    }, 3000);
  };

  const faqs = [
    {
      q: "How do I get my profile verified with a Blue Badge?",
      a: "Go to your Profile > tap 'Verify My Profile' > record a 3-second live selfie pose. Our biometric AI will confirm your identity within 60 seconds.",
    },
    {
      q: "How do I cancel or modify my Prem Jodo subscription?",
      a: "If subscribed via Google Play or Apple App Store, open your respective store subscriptions setting. If paid via UPI/Card, go to Profile > Settings > Manage Subscription > Cancel Auto-Renewal.",
    },
    {
      q: "What is your refund policy for duplicate or failed transactions?",
      a: "If your money was debited but features were not activated, or if you were charged twice, our billing team will process a full refund to your original payment method within 5 to 7 working days.",
    },
    {
      q: "How can I block or report someone?",
      a: "Tap the 3 dots (...) in the top corner of any user's profile or chat window, select 'Report & Block', and choose the reason. Our safety team acts immediately.",
    },
    {
      q: "How can I change my discovery location or distance range?",
      a: "Go to Discovery Filters > Distance Radius to adjust search distance between 1 km to 100 km, or use Passport (Gold/Platinum) to search any city.",
    },
  ];

  return (
    <div className="support-page-root">
      <Navbar onOpenAuth={openAuth} />

      <main className="support-page-main">
        {/* Hero */}
        <section className="support-hero-section">
          <div
            ref={heroRef}
            className={`support-hero-inner scroll-reveal ${
              isHeroVisible ? "is-revealed" : ""
            }`}
          >
            <h1 className="support-hero-title">
              {t("supportPage.titlePrefix")}
              <span className="support-title-gradient">
                {t("supportPage.titleHighlight")}
              </span>
            </h1>
            <p className="support-hero-subtitle">
              {t("supportPage.subtitle")}
            </p>
          </div>
        </section>

        {/* FAQ and Contact Grid */}
        <section className="support-content-section">
          <div className="container">
            <div
              ref={contentRef}
              className={`support-grid-wrap scroll-reveal ${
                isContentVisible ? "is-revealed" : ""
              }`}
            >
              {/* FAQ Accordion List */}
              <div className="support-faq-col">
                <h2 className="support-section-heading">
                  {t("supportPage.faqHeading")}
                </h2>
                <div className="support-faq-list">
                  {faqs.map((faq, i) => {
                    const isOpen = openFaqIndex === i;
                    return (
                      <div
                        key={i}
                        className={`support-faq-item ${isOpen ? "is-open" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : i)}
                          className="support-faq-trigger"
                        >
                          <span className="support-faq-question">
                            {faq.q}
                          </span>
                          <div className="support-faq-icon-btn">
                            {isOpen ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        <div className="support-faq-body-collapse">
                          <div className="support-faq-inner-body">
                            <div className="support-faq-body-content">
                              <div className="support-faq-body-divider">
                                <p className="support-faq-answer">
                                  {faq.a}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Contact Form */}
              <div className="support-form-sticky-wrap">
                <div className="support-form-card">
                  <div className="support-form-header">
                    <h3 className="support-form-title">
                      {t("supportPage.contactHeading")}
                    </h3>
                    <p className="support-form-subtitle">
                      {t("supportPage.contactSub")}
                    </p>
                  </div>

                  {submitted ? (
                    <div className="support-success-box">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                        {t("supportPage.sentTitle")}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {t("supportPage.sentDesc")}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="support-form-fields">
                      <div>
                        <label className="support-input-label">
                          {t("supportPage.nameLabel")}
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="support-input-text"
                        />
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.emailLabel")}
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="name@example.com"
                          className="support-input-text"
                        />
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.categoryLabel")}
                        </label>
                        <CustomSelect
                          value={form.topic}
                          onChange={(val) => setForm({ ...form, topic: val })}
                          size="sm"
                          options={[
                            { value: "general", label: "General Support", icon: LifeBuoy, desc: "Account, features & app feedback" },
                            { value: "billing", label: "Subscriptions & Payments", icon: CreditCard, desc: "Plus, Gold, Platinum billing & refunds" },
                            { value: "safety", label: "Safety & Reporting an Account", icon: ShieldCheck, desc: "Harassment, fake profiles & safety issues" },
                            { value: "verification", label: "Selfie Verification Issue", icon: Camera, desc: "Blue badge & face scan assistance" },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.msgLabel")}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Describe your issue or feedback in detail..."
                          className="support-textarea"
                        />
                      </div>

                      <button
                        type="submit"
                        className="support-submit-btn"
                      >
                        {t("supportPage.submitBtn")}
                      </button>
                    </form>
                  )}
                </div>
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
