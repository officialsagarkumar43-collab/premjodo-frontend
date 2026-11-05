"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { CustomSelect } from "@/components/reusable";
import { useAuth } from "@/context/AuthContext";
import ticketService, { TICKET_CATEGORIES } from "@/lib/services/ticket.service";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Send,
  HelpCircle,
  CreditCard,
  RotateCcw,
  UserCheck,
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";

export default function ContactUsPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketResult, setTicketResult] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general_support",
    subject: "",
    description: "",
    priority: "medium",
    transactionId: "",
  });

  // Auto-fill form details for authenticated users
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

  const openAuth = () => setIsAuthOpen(true);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const isGuest = !isAuthenticated;
      let finalDescription = form.description || "";
      if (form.transactionId && form.category === "subscriptions_payments") {
        finalDescription = `[Transaction / Order ID: ${form.transactionId}]\n\n${finalDescription}`;
      }

      const res = await ticketService.createTicket(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          category: form.category,
          subject: form.subject,
          description: finalDescription,
          priority: form.priority,
          attachments: [],
        },
        isGuest
      );

      setTicketResult(res);
    } catch (err) {
      console.error("[ContactUsPage] Ticket error:", err);
      setErrorMessage(
        err?.message || "Failed to submit ticket. Please check your connection and try again."
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
      transactionId: "",
    });
  };

  const contactCards = [
    {
      icon: Mail,
      title: "Email Support",
      desc: "For general queries, accounts & matchmaking support",
      primary: "officialsagarkumar43@gmail.com",
      href: "mailto:officialsagarkumar43@gmail.com",
      badge: "Response in 24h",
    },
    {
      icon: Phone,
      title: "Contact Number",
      desc: "Direct telephone assistance & general queries",
      primary: "+91 7087362399",
      href: "tel:+917087362399",
      badge: "Mon - Sat: 9 AM - 7 PM",
    },
    {
      icon: LifeBuoy,
      title: "Helpline Number",
      desc: "Dedicated helpline for urgent account & profile help",
      primary: "+91 9625477336",
      href: "tel:+919625477336",
      badge: "24x7 Assistance",
    },
    {
      icon: CreditCard,
      title: "Billing & Grievance Desk",
      desc: "For payment queries, refunds & grievance redressal",
      primary: "officialsagarkumar43@gmail.com",
      href: "mailto:officialsagarkumar43@gmail.com",
      badge: "SLA: 24 - 48h",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="relative py-16 sm:py-24 px-4 text-center overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              We are Here to{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                Help You
              </span>
            </h1>
            <p className="text-base sm:text-lg poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Have questions about your account, payment transactions, safety, or need assistance? Reach out through any of our official channels below.
            </p>
          </div>
        </section>

        {/* 4 Contact Cards Grid */}
        <section className="py-12 -mt-6">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {contactCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-500/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] poppins-medium text-zinc-500 dark:text-zinc-400">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="poppins-bold text-sm text-zinc-900 dark:text-white">
                        {card.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <a
                      href={card.href}
                      className="text-xs poppins-bold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 hover:underline break-all block pt-2 transition-colors"
                    >
                      {card.primary}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Corporate Entity Section */}
        <section className="py-8 pb-16">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7">
                <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
                  <div>
                    <h2 className="text-2xl poppins-black text-zinc-900 dark:text-white">
                      Raise a Support Ticket
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Both registered members and guest customers can submit inquiries. Our team will review and respond promptly.
                    </p>
                  </div>



                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {ticketResult ? (
                    <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="poppins-bold text-base text-emerald-900 dark:text-emerald-200">
                          Support Ticket Submitted Successfully!
                        </h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          Your Support Ticket Reference ID is:{" "}
                          <strong className="font-mono text-sm px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-bold">
                            {ticketResult?.ticketId || "TCK-CONFIRMED"}
                          </strong>
                        </p>
                      </div>

                      {/* Ticket Meta summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-left text-[11px]">
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Category</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block">
                            {categoryOptions.find((c) => c.value === (ticketResult?.category || form.category))?.label || ticketResult?.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Status</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                            {ticketResult?.status || "Open"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Reply Via</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            Email Update
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Customer</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {ticketResult?.isGuest || !isAuthenticated ? "Guest" : "Registered"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-emerald-600 dark:text-emerald-400 max-w-sm mx-auto leading-relaxed">
                        {ticketResult?.message || "Our team will review your ticket and reply directly to your email address."}
                      </p>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 rounded-xl text-xs poppins-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
                      >
                        Submit Another Query
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Your Full Name {!isAuthenticated && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            type="text"
                            required={!isAuthenticated}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Rohan Sharma"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Email Address {!isAuthenticated && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            type="email"
                            required={!isAuthenticated}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Phone / Mobile Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Inquiry Category <span className="text-rose-500">*</span>
                        </label>
                        <CustomSelect
                          value={form.category}
                          onChange={(val) => setForm({ ...form, category: val })}
                          size="sm"
                          options={categoryOptions}
                        />
                      </div>

                      {form.category === "subscriptions_payments" && (
                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Payment Transaction ID / Order ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={form.transactionId}
                            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                            placeholder="e.g. pay_XXXXXX, order_XXXXXX or UPI Reference"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Please describe your question or issue in detail so our support team can assist you..."
                          className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl text-xs poppins-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:opacity-95 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Support Ticket...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Support Ticket</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Company Info & Statutory Grievance Column */}
              <div className="lg:col-span-5 space-y-6" id="company-info">
                {/* Registered Corporate Entity Box */}
                <div className="p-6 sm:p-7 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="poppins-bold text-base">Contact & Support Details</h3>
                  </div>

                  <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <div>
                      <p className="text-zinc-500">Platform Name:</p>
                      <p className="poppins-bold text-zinc-900 dark:text-white text-sm">Prem Jodo</p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Official Email:</p>
                      <a href="mailto:officialsagarkumar43@gmail.com" className="poppins-bold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 hover:underline">
                        officialsagarkumar43@gmail.com
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-zinc-500">Contact Number:</p>
                        <a href="tel:+917087362399" className="poppins-bold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400">
                          +91 7087362399
                        </a>
                      </div>
                      <div>
                        <p className="text-zinc-500">Helpline Number:</p>
                        <a href="tel:+919625477336" className="poppins-bold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400">
                          +91 9625477336
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="text-zinc-500">Operating Hours:</p>
                      <p className="poppins-bold text-zinc-900 dark:text-white">Mon - Sat: 9 AM - 7 PM IST</p>
                    </div>
                  </div>
                </div>

                {/* Statutory Grievance Redressal Officer */}
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-purple-100 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                    <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="poppins-bold text-sm">Statutory Grievance Redressal Officer</h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Under the Information Technology Act, 2000 and SPDI Rules, users can escalate unresolved concerns directly to our Grievance Officer:
                  </p>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-purple-100 dark:border-zinc-800 text-xs space-y-1.5">
                    <p className="font-bold text-zinc-900 dark:text-white">Grievance Redressal Officer</p>
                    <p className="text-zinc-500">Email: <a href="mailto:officialsagarkumar43@gmail.com" className="text-zinc-900 dark:text-white font-bold hover:underline">officialsagarkumar43@gmail.com</a></p>
                    <p className="text-zinc-500">Helpline: <a href="tel:+919625477336" className="text-zinc-900 dark:text-white font-bold hover:underline">+91 9625477336</a></p>
                    <p className="text-[11px] text-zinc-400 pt-1">SLA: Acknowledgment within 24-48 hrs, resolution within 15 days.</p>
                  </div>
                </div>

                {/* Quick Policy Cross Links */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Looking for refund rules?</span>
                  <Link href="/refund-policy" prefetch={false} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                    Refund Policy →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="register"
      />
    </div>
  );
}
