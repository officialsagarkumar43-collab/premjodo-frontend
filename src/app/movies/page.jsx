"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  Film,
  Sparkles,
  Ticket,
  Armchair,
  Popcorn,
  Percent,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function MovieBookingComingSoonPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  const movieFeatures = [
    {
      icon: Armchair,
      title: "Authorized Cinema Multiplex Partners",
      desc: "Direct integration with licensed theater chains offering instant digital seat allocation across India.",
    },
    {
      icon: Ticket,
      title: "Real-Time Digital Ticketing",
      desc: "Instant confirmation with QR-code entry passes delivered directly to your email and account.",
    },
    {
      icon: Percent,
      title: "Transparent Pricing & GST Invoicing",
      desc: "Zero hidden charges with itemized statutory GST tax invoices on all ticket reservations.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments & Cancellation Support",
      desc: "Protected through RBI-authorized payment gateways adhering to standard ticket cancellation guidelines.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section with Coming Soon Image */}
        <section className="relative py-12 sm:py-16 px-4 text-center overflow-hidden bg-gradient-to-b from-purple-50/70 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950">
          {/* Subtle glow background */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-purple-500/15 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container max-w-5xl mx-auto space-y-8 relative z-10">
            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl poppins-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                Prem Jodo{" "}
                <span className="bg-gradient-to-r from-purple-600 via-rose-600 to-pink-500 bg-clip-text text-transparent inline-block">
                  Movie Booking
                </span>
              </h1>
              <p className="text-sm sm:text-base poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                We are developing an integrated digital entertainment and movie ticket booking portal for our customers. Enjoy seamless seat reservation, exclusive offers, and instant verified e-tickets.
              </p>
            </div>

            {/* Coming Soon Graphic Showcase */}
            <div className="relative max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 group">
              <img
                src="/images/movies-coming-soon.jpg"
                alt="Prem Jodo Movie Booking Services"
                className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    In Development
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">
                    Authorized Cinema Multiplex Ticketing
                  </span>
                </div>
              </div>
            </div>

            {/* Notify Me Email Box */}
            <div className="max-w-md mx-auto pt-2 space-y-3">
              {isSubscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs poppins-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Thank you! We will notify you as soon as movie ticketing is officially launched.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early booking notifications..."
                    className="flex-1 px-5 py-3.5 rounded-2xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl text-xs poppins-bold text-white bg-gradient-to-r from-purple-600 via-rose-600 to-pink-600 hover:opacity-95 shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Get Notified</span>
                  </button>
                </form>
              )}

              {/* Statutory Legal Footnote */}
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Operating in compliance with Indian Information Technology Act, 2000. All transactions covered under our{" "}
                <Link href="/terms" prefetch={false} className="underline hover:text-purple-500">Terms</Link> &amp;{" "}
                <Link href="/refund-policy" prefetch={false} className="underline hover:text-purple-500">Cancellation Policy</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Teasers */}
        <section className="py-12 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="container max-w-5xl">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <h2 className="text-xl sm:text-2xl poppins-black text-zinc-900 dark:text-white">
                Customer Commitments &amp; Standards
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Providing transparent, safe, and licensed movie ticket booking services for all our customers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {movieFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="poppins-bold text-sm text-zinc-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Back CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs poppins-bold hover:opacity-90 transition-opacity"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
