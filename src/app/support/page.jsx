"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import ticketService, { TICKET_CATEGORIES } from "@/lib/services/ticket.service";
import "@/styles/support.css";

import {
  CreditCard,
  Camera,
  Plus,
  Minus,
  LifeBuoy,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  HelpCircle,
  Clock,
  Send,
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
  const { user, profile, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketResult, setTicketResult] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general_support",
    subject: "",
    description: "",
    priority: "medium",
  });

  // Auto-fill details for logged in members
  useEffect(() => {
    if (isAuthenticated && (user || profile)) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user?.fullName || profile?.fullName || user?.name || "",
        email: prev.email || user?.email || profile?.email || "",
        phone: prev.phone || user?.phoneNumber || profile?.phone || "",
      }));
    }
  }, [isAuthenticated, user, profile]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const isGuest = !isAuthenticated;
      const res = await ticketService.createTicket(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          category: form.category,
          subject: form.subject,
          description: form.description,
          priority: form.priority,
          attachments: [],
        },
        isGuest
      );

      setTicketResult(res);
    } catch (err) {
      console.error("[SupportPage] Ticket error:", err);
      setErrorMessage(
        err?.message || "Failed to submit ticket. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTicketResult(null);
    setErrorMessage("");
    setForm({
      name: isAuthenticated ? user?.fullName || profile?.fullName || "" : "",
      email: isAuthenticated ? user?.email || profile?.email || "" : "",
      phone: isAuthenticated ? user?.phoneNumber || profile?.phone || "" : "",
      category: "general_support",
      subject: "",
      description: "",
      priority: "medium",
    });
  };

  const categoryOptions = [
    {
      value: "general_support",
      label: "General Support",
      icon: LifeBuoy,
      desc: "Account, features & app feedback",
    },
    {
      value: "subscriptions_payments",
      label: "Subscriptions & Payments",
      icon: CreditCard,
      desc: "Plus, Gold, Platinum billing & refunds",
    },
    {
      value: "safety_reporting",
      label: "Safety & Reporting an Account",
      icon: ShieldCheck,
      desc: "Harassment, fake profiles & safety issues",
    },
    {
      value: "selfie_verification",
      label: "Selfie Verification Issue",
      icon: Camera,
      desc: "Blue badge & face scan assistance",
    },
  ];

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
            className={`support-hero-inner scroll-reveal ${isHeroVisible ? "is-revealed" : ""
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
              className={`support-grid-wrap scroll-reveal ${isContentVisible ? "is-revealed" : ""
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


                  {errorMessage && (
                    <div className="support-alert-error">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {ticketResult ? (
                    <div className="support-ticket-card">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {t("supportPage.sentTitle") || "Support Ticket Created Successfully!"}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Your Support Ticket Reference ID is:
                        </p>
                        <div className="support-ticket-id-pill mt-2">
                          {ticketResult?.ticketId || "TCK-CONFIRMED"}
                        </div>
                      </div>

                      <div className="support-ticket-meta">
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {categoryOptions.find((c) => c.value === (ticketResult?.category || form.category))?.label || ticketResult?.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-bold">Status</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                            {ticketResult?.status || "Open"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-bold">Reply Via</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            Email Update
                          </span>
                        </div>
                      
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {ticketResult?.message || t("supportPage.sentDesc") || "Our support team will review your inquiry and reply via email shortly."}
                      </p>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="support-reset-btn"
                      >
                        Raise Another Ticket
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="support-form-fields">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="support-input-label">
                            {t("supportPage.nameLabel")} {!isAuthenticated && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={!isAuthenticated}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Rohan Sharma"
                            className="support-input-text"
                          />
                        </div>

                        <div>
                          <label className="support-input-label">
                            {t("supportPage.emailLabel")} {!isAuthenticated && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            type="email"
                            required={!isAuthenticated}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="name@example.com"
                            className="support-input-text"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.phoneLabel") || "Phone Number (Optional)"}
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="support-input-text"
                        />
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.categoryLabel")} <span className="text-rose-500">*</span>
                        </label>
                        <CustomSelect
                          value={form.category}
                          onChange={(val) => setForm({ ...form, category: val })}
                          size="sm"
                          options={categoryOptions}
                        />
                      </div>

                      <div>
                        <label className="support-input-label">
                          {t("supportPage.msgLabel") || "Description"} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Describe your issue or feedback in detail..."
                          className="support-textarea"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="support-submit-btn"
                      >
                        {isSubmitting ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Ticket...</span>
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                            <Send className="w-4 h-4" />
                            <span>{t("supportPage.submitBtn")}</span>
                          </span>
                        )}
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
