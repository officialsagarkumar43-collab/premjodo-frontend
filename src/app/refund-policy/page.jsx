"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { DocSidebar } from "@/components/common/DocSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  Mail,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const TOC_ITEMS = [
  { id: "guidelines", title: "Refund Guidelines" },
  { id: "refunds", title: "Refunds" },
  { id: "reasons", title: "Reasons for Potential Refunds", shortTitle: "Potential Refunds" },
  { id: "chargebacks", title: "Chargebacks" },
  { id: "contact", title: "Contact Us" },
];

export default function RefundPolicyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = () => {
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    setIsAuthOpen(true);
  };

  const supportEmail = "officialsagarkumar43@gmail.com";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Editorial Pagehead matching Redesign style */}
        <section className="pagehead">
          <div className="wrap">
            <span className="pill">LEGAL & BILLING</span>
            <h1>Refunds Policy.</h1>
            <p>
              When Prem Jodo issues refunds for subscriptions and coins, how to request one, and why you should contact us before starting a chargeback.
            </p>
            <div className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Last updated: 24 November 2026
            </div>
          </div>
        </section>

        {/* 2-Column Documentation Layout matching Chitchat */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-6xl">
            <div className="doc-layout">
              {/* Left Column: Sticky Scrollspy TOC Sidebar */}
              <DocSidebar items={TOC_ITEMS} />

              {/* Right Column: Doc Content */}
              <div className="doc-content">
                {/* Disclaimer Callout Box (matching chitchat.gg) */}
                {/* <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-3.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm leading-relaxed">
                      <strong className="font-bold block mb-1 text-amber-950 dark:text-amber-100">
                        Please note:
                      </strong>
                      Filters (e.g. gender, location, distance, interests) in both discovery matching, text, and video chats are based on user input, so results may vary based on active user availability. We do not guarantee that filters will be 100% accurate, and we do not offer refunds for any filter or profile mismatches.
                    </div>
                  </div>
                </div> */}

                {/* Section 1: Refund Guidelines */}
                <div
                  id="guidelines"
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Refund Guidelines
                    </h2>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
                    <p>
                      Our main aim is to ensure that you’re satisfied with our service. While we’re confident in the quality of our digital goods and subscriptions, we know issues can pop up. If they do, we’re committed to fixing them quickly.
                    </p>
                    <p>
                      For refunds, reach out to us at{" "}
                      <a
                        href={`mailto:${supportEmail}`}
                        className="font-bold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        {supportEmail}
                      </a>
                      . We’ll look into each case individually and work towards a solution. However, we won’t tolerate any attempts to misuse our system or mistreat our staff. If an account engages in such behavior, we reserve the right to ban it and any linked accounts from our services.
                    </p>
                  </div>
                </div>

                {/* Section 2: Refunds & Payment Processing */}
                <div
                  id="refunds"
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Refunds
                    </h2>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
                    <p>
                      We process all payments, whether for one-off purchases or subscriptions, through secure, RBI-licensed payment aggregators and gateways. If you encounter issues with a purchase, believe a fraudulent payment has been made, or did not authorize your child to make a purchase, please contact us immediately at{" "}
                      <a
                        href={`mailto:${supportEmail}`}
                        className="font-bold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        {supportEmail}
                      </a>
                      . We will work to address the issue and provide a refund where appropriate.
                    </p>
                  </div>
                </div>

                {/* Section 3: Reasons for potential refunds */}
                <div
                  id="reasons"
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Reasons for potential refunds:
                    </h2>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 mt-2 shrink-0" />
                        <span>
                          <strong className="text-zinc-800 dark:text-zinc-200">Fraudulent or unauthorized payments</strong> (proof is required).
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 mt-2 shrink-0" />
                        <span>
                          <strong className="text-zinc-800 dark:text-zinc-200">Delivery issues with purchased digital goods</strong> or subscription benefits.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 mt-2 shrink-0" />
                        <span>
                          <strong className="text-zinc-800 dark:text-zinc-200">Payments made without the cardholder’s permission</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 mt-2 shrink-0" />
                        <span>
                          <strong className="text-zinc-800 dark:text-zinc-200">Duplicate or multiple charges</strong> caused by network or payment gateway technical errors.
                        </span>
                      </li>
                    </ul>

                    <p className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      The Terms are subject to change at any time, and we recommend you occasionally check for updates.
                    </p>
                  </div>
                </div>

                {/* Section 4: Chargebacks */}
                <div
                  id="chargebacks"
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Chargebacks
                    </h2>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-3">
                    <p>
                      Contact us before resorting to a chargeback; we’re here to help resolve any issues. Initiating a chargeback without attempting resolution may result in an account ban, along with associated accounts. We vigorously contest chargebacks to safeguard our services and users.
                    </p>
                  </div>
                </div>

                {/* Section 5: Contact Card */}
                <div
                  id="contact"
                  className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-rose-200 dark:border-zinc-800 shadow-sm space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Need Help with a Refund?
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Our billing support team typically responds within 24 to 48 hours.
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
                    <p>
                      To help us process your request swiftly, please include:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs pl-2">
                      <li>Your registered Mobile Number or Email ID</li>
                      <li>Payment Transaction ID / Order Reference Number</li>
                      <li>Date and amount of the transaction</li>
                      <li>A brief explanation of the issue</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`mailto:${supportEmail}?subject=Refund%20Request%20-%20Prem%20Jodo`}
                      className="btn inline-flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email {supportEmail}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Quick Links Footer row */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-500">
                    Related Legal Documents:
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/terms" prefetch={false} className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                      Terms of Service →
                    </Link>
                    <Link href="/privacy" prefetch={false} className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                      Privacy Policy →
                    </Link>
                    <Link href="/contact-us" prefetch={false} className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                      Contact Us →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode="register"
      />
    </div>
  );
}
