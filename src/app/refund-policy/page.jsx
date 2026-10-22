"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  RotateCcw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  FileText,
  Mail,
  ShieldCheck,
  Ban,
  ArrowRight,
} from "lucide-react";

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

  const sections = [
    {
      id: "overview",
      icon: FileText,
      title: "1. Policy Overview & Commitment",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            At <strong className="text-zinc-900 dark:text-white">Prem Jodo</strong>, we are committed to complete transparency, fair billing, and high customer satisfaction.
          </p>
          <p>
            This Cancellation and Refund Policy outlines the terms and procedures for cancelling subscriptions, requesting refunds for digital purchases, and resolving payment discrepancies in full accordance with standard merchant banking and payment aggregator operating guidelines.
          </p>
        </div>
      ),
    },
    {
      id: "cancellation",
      icon: RotateCcw,
      title: "2. Subscription Cancellation Procedure",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Users can cancel recurring VIP memberships (Prem Jodo Plus, Gold, Platinum) at any time without any cancellation fees:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="poppins-bold text-xs text-zinc-900 dark:text-white block">
                📱 Paid via Web / Direct UPI / Gateway
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Go to <strong className="text-zinc-800 dark:text-zinc-200">Profile &gt; Settings &gt; Manage VIP Membership &gt; Cancel Auto-Renewal</strong>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="poppins-bold text-xs text-zinc-900 dark:text-white block">
                🛍️ Paid via Google Play / Apple App Store
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Open Google Play Store / Apple ID Subscriptions settings on your mobile device and select <strong className="text-zinc-800 dark:text-zinc-200">Prem Jodo &gt; Cancel Subscription</strong>.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            * Upon cancellation, your auto-renewal is terminated immediately, but you will continue to enjoy your active VIP privileges until the end of your current prepaid billing cycle.
          </p>
        </div>
      ),
    },
    {
      id: "eligibility",
      icon: CheckCircle2,
      title: "3. Refund Eligibility Conditions",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Refunds are granted under the following verified circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Duplicate / Multiple Charges:</strong> If an inadvertent technical glitch or network error results in double or multiple deductions for a single plan purchase.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Failed Service Delivery / Payment Deducted but Not Activated:</strong> If your bank account, card, or UPI was debited, but your subscription or in-app digital items failed to activate within 24 hours of payment confirmation.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Persistent Technical Defect:</strong> If our platform experiences a major server outage preventing you from accessing core paid features for an extended period, verified by our technical engineering team.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Accidental Purchase Grace Window:</strong> If an unintended plan was purchased and a refund request is filed within <strong className="text-zinc-900 dark:text-white">48 hours</strong> of purchase, provided none of the paid features (Super Likes, Boosts, Chat Unlocks, Coins) have been consumed.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "non-refundable",
      icon: Ban,
      title: "4. Non-Refundable Items & Situations",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>Refunds will NOT be issued in the following scenarios:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Consumed Virtual Items:</strong> Virtual coins, gift items, or profile spotlights that have already been spent or utilized.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Violations of Community Guidelines:</strong> Accounts terminated, suspended, or banned due to harassment, hate speech, romance scams, catfishing, explicit solicitations, or fraudulent conduct.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Partial Billing Period Utilization:</strong> Requests for pro-rata refunds made after substantial use of subscription features during the active month/cycle.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Lack of Match Results:</strong> Prem Jodo provides matchmaking tools and discovery algorithms; however, matching outcomes depend on mutual user interest, and lack of matches is not grounds for a refund.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "timeline-mode",
      icon: Clock,
      title: "5. Refund Timelines & Settlement Mechanism",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs space-y-2">
            <div className="flex items-center gap-2 poppins-bold text-rose-900 dark:text-rose-200">
              <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Standard Payment Gateway Settlement Timeline</span>
            </div>
            <p className="text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
              Once a refund request is approved by our billing team, the amount will be processed and credited back to the customer's <strong className="text-rose-950 dark:text-white underline">original source of payment</strong> (Bank Account, Credit/Debit Card, UPI ID, or Wallet) within <strong className="text-rose-950 dark:text-white font-bold">5 to 7 working days</strong>.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-2 pt-1 text-xs">
            <li><strong className="text-zinc-800 dark:text-zinc-200">UPI / Net Banking Refunds:</strong> Typically reflect in your bank account within 3 to 5 business days.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Credit / Debit Card Refunds:</strong> Typically reflect within 5 to 7 business days, depending on your issuing bank's settlement cycle.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Wallet Refunds:</strong> Typically credited within 24 to 48 hours.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "how-to-claim",
      icon: Mail,
      title: "6. How to Submit a Refund Claim",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            To file a refund or billing discrepancy request, please follow these simple steps:
          </p>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
            <p className="poppins-bold text-zinc-900 dark:text-white">Send an email to our dedicated Billing &amp; Refund Desk:</p>
            <p className="text-zinc-600 dark:text-zinc-400">Official Billing Email: <a href="mailto:officialsagarkumar43@gmail.com" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">officialsagarkumar43@gmail.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Helpline: <a href="tel:+919625477336" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 9625477336</a> | Contact: <a href="tel:+917087362399" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 7087362399</a></p>
            <p className="poppins-semibold text-zinc-800 dark:text-zinc-200 pt-1">Please include the following information:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-400 pl-1">
              <li>Your Registered Email Address or Phone Number on Prem Jodo</li>
              <li>Transaction ID / Order ID (received via email or payment gateway receipt)</li>
              <li>Transaction Date and Exact Amount Debited (in INR)</li>
              <li>Brief explanation of the issue (e.g., duplicate deduction, feature not unlocked)</li>
              <li>Screenshot of bank debit notification or payment receipt (optional but recommended)</li>
            </ul>
            <div className="pt-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 poppins-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>SLA: We acknowledge all refund requests within 24 hours and issue a resolution decision within 48 to 72 hours.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "disputes",
      icon: ShieldCheck,
      title: "7. Payment Disputes & Chargebacks",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            We encourage you to contact us first at <a href="mailto:officialsagarkumar43@gmail.com" className="text-rose-600 dark:text-rose-400 font-bold hover:underline">officialsagarkumar43@gmail.com</a> before raising an external bank chargeback. Our support team responds quickly and is authorized to issue instant reversals for verified billing discrepancies without hassle.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              Prem Jodo <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">Cancellation &amp; Refund Policy</span>
            </h1>
            <p className="text-sm sm:text-base poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Clear, fair, and transparent guidelines on subscription cancellations, payment reversals, and refund timelines.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 poppins-medium pt-1">
              <span>Standard Settlement: <strong className="text-zinc-700 dark:text-zinc-300">5 - 7 Working Days</strong></span>
              <span>•</span>
              <span>Platform: <strong className="text-zinc-700 dark:text-zinc-300">Prem Jodo</strong></span>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl space-y-8">
            {/* Quick Index */}
            <div className="hidden sm:block p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs poppins-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Quick Navigation
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                  >
                    {sec.title.split(". ")[1] || sec.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 scroll-mt-24 transition-all"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl poppins-bold text-zinc-900 dark:text-white">
                      {sec.title}
                    </h2>
                  </div>
                  {sec.content}
                </div>
              );
            })}

            {/* Need Direct Help Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-rose-100 dark:border-zinc-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg poppins-bold text-zinc-900 dark:text-white">
                  Need Help With a Recent Transaction?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
                  Our billing and payment support team is available Monday to Saturday to resolve any payment concerns.
                </p>
              </div>
              <Link
                href="/contact-us"
                prefetch={false}
                className="px-6 py-3 rounded-2xl text-xs poppins-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Contact Billing Team</span>
                <ArrowRight className="w-4 h-4" />
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
