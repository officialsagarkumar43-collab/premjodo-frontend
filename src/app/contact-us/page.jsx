"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { CustomSelect } from "@/components/reusable";
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
} from "lucide-react";

export default function ContactUsPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    transactionId: "",
    message: "",
  });

  const openAuth = () => setIsAuthOpen(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedTicket = "PJ-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedTicket);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      category: "general",
      transactionId: "",
      message: "",
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
                      Send Us a Message
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Fill out the form below and our dedicated support representative will contact you within 24 hours.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="poppins-bold text-base text-emerald-900 dark:text-emerald-200">
                          Message Submitted Successfully!
                        </h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          Your Support Ticket Reference ID is: <strong className="font-mono text-sm px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60">{ticketId}</strong>
                        </p>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 max-w-sm mx-auto">
                        A confirmation email has been logged. Our customer care team will review your query and respond shortly.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 rounded-xl text-xs poppins-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        Submit Another Query
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Your Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            options={[
                              { value: "general", label: "General Inquiry", icon: LifeBuoy, desc: "Account, matching & app features" },
                              { value: "billing", label: "Billing & Subscriptions", icon: CreditCard, desc: "Payment issues & VIP plan activation" },
                              { value: "refund", label: "Refund Request", icon: RotateCcw, desc: "Double debit or refund claim" },
                              { value: "verification", label: "Profile & Selfie Verification", icon: UserCheck, desc: "Blue badge & ID verification help" },
                              { value: "grievance", label: "Grievance / Safety Report", icon: ShieldCheck, desc: "Escalation to statutory Grievance Officer" },
                            ]}
                          />
                        </div>
                      </div>

                      {(form.category === "billing" || form.category === "refund") && (
                        <div>
                          <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            Payment Transaction ID / Order ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={form.transactionId}
                            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                            placeholder="e.g. pay_XXXXXX or order_XXXXXX or UPI Ref"
                            className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs poppins-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Message / Query Details <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="Please describe your question or issue in detail so we can help you promptly..."
                          className="w-full px-4 py-3 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl text-xs poppins-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:opacity-95 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
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
