"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Scale,
  Ban,
  Lock,
  Building2,
  Mail,
  RefreshCw,
} from "lucide-react";

export default function TermsOfServicePage() {
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
      id: "acceptance",
      icon: UserCheck,
      title: "1. Acceptance of Terms & Eligibility",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Welcome to <strong className="text-zinc-900 dark:text-white">Prem Jodo</strong> (the "Platform" or "App"), operated by <strong className="text-zinc-900 dark:text-white">Prem Jodo</strong> ("Platform", "we", "us", or "our").
          </p>
          <p>
            By creating an account, downloading, accessing, or using our mobile application, website, or services, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Age Requirement:</strong> You must be at least <strong className="text-zinc-900 dark:text-white">18 years of age</strong> (or the legal age of majority in your jurisdiction) to use Prem Jodo. Use by minors is strictly prohibited.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Legal Capacity:</strong> You represent and warrant that you have the right, authority, and capacity to enter into this agreement and abide by all terms.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">No Prior Bans:</strong> You must not have been previously suspended or removed from our Platform for violations of our policies.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Authentic Representation:</strong> You agree to provide accurate, current, and complete registration information and keep your profile updated.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "services",
      icon: Building2,
      title: "2. Description of Services & Verification",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Prem Jodo is an online social discovery, matchmaking, and interactive connection platform designed to help consenting adults connect based on mutual preferences, hobbies, and values.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Matching & Discovery:</strong> Location-based and preference-based recommendation engine for singles.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Real-Time Messaging & Media:</strong> In-app chat, voice notes, virtual gifting, and audio/video calling.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">AI Selfie Biometric Verification:</strong> We implement selfie liveness verification to award verified badges and prevent fraudulent impersonation. Biometric scans are used strictly for verification and never sold.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "payments-billing",
      icon: CreditCard,
      title: "3. Subscriptions, Payments & Billing Terms",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Prem Jodo offers both free tier services and premium paid subscriptions (e.g., Prem Jodo Plus, Gold, Platinum, VIP Boosts, In-App Virtual Coins).
          </p>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white poppins-bold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Secure Payment Processing & Merchant Compliance</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              All electronic payments on Prem Jodo (including UPI, Credit/Debit Cards, Net Banking, and Wallets) are routed through authorized, RBI-licensed, PCI-DSS Level 1 compliant payment aggregators and gateways. Prem Jodo does not store credit/debit card numbers, CVVs, net banking credentials, or UPI PINs on its servers.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Pricing & Taxes:</strong> All subscription fees and virtual item prices are displayed in Indian Rupees (INR) or your local currency and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Billing Cycles & Auto-Renewal:</strong> Subscriptions are billed on a recurring periodic basis (e.g., weekly, monthly, quarterly, annually). Auto-renewal continues until cancelled by you prior to the expiration of the current cycle.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Price Modifications:</strong> We reserve the right to revise subscription fees with advance in-app notification before renewal.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cancellation-refunds",
      icon: RefreshCw,
      title: "4. Cancellation & Refund Policy",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Your satisfaction and fair billing are essential to us. Our cancellation and refund terms comply with standard payment gateway merchant operating regulations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Subscription Cancellation:</strong> You can cancel your subscription auto-renewal at any time via your in-app Profile Settings or through your Apple App Store / Google Play account. You will retain access to premium features until the end of your prepaid period.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Refund Settlement Timelines:</strong> In cases of duplicate charges, technical non-delivery, or approved billing disputes, refunds will be initiated and credited back to the customer's original payment method (Bank Account, Card, UPI, or Wallet) within <strong className="text-zinc-900 dark:text-white">5 to 7 working days</strong>.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Full Policy:</strong> Please review our detailed <Link href="/refund-policy" prefetch={false} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">Cancellation & Refund Policy</Link> for complete dispute resolution procedures.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "prohibited-conduct",
      icon: Ban,
      title: "5. User Conduct & Community Guidelines",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            To maintain a respectful, safe, and welcoming community for everyone, users agree NOT to engage in the following prohibited behaviors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <span className="poppins-bold block">❌ No Harassment or Hate Speech</span>
              <p className="text-rose-800/80 dark:text-rose-300">Stalking, bullying, intimidation, threats, defamation, racism, casteism, or hate speech result in permanent ban.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <span className="poppins-bold block">❌ No Scams or Financial Solicitation</span>
              <p className="text-rose-800/80 dark:text-rose-300">Asking for money, UPI transfers, crypto, investment schemes, or commercial escort/sex work solicitation is strictly prohibited.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <span className="poppins-bold block">❌ No Catfishing or Impersonation</span>
              <p className="text-rose-800/80 dark:text-rose-300">Using photos of celebrities, other real individuals without consent, or creating bot profiles will lead to immediate account termination.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <span className="poppins-bold block">❌ No Explicit or Non-Consensual Media</span>
              <p className="text-rose-800/80 dark:text-rose-300">Unsolicited sexually explicit material, non-consensual imagery, or violence is zero-tolerated and reported to legal authorities.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "content-ip",
      icon: FileText,
      title: "6. Intellectual Property & User Content License",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-800 dark:text-zinc-200">Your Content:</strong> You retain ownership of all photographs, bios, audio notes, and text you post. You grant Prem Jodo a non-exclusive, worldwide, royalty-free license to host, store, display, and transmit your content solely for operating and promoting the matchmaking service.
          </p>
          <p>
            <strong className="text-zinc-800 dark:text-zinc-200">Platform IP:</strong> All trademarks, algorithms, logos, UI designs, code, graphics, and proprietary software are the exclusive intellectual property of Prem Jodo.
          </p>
        </div>
      ),
    },
    {
      id: "safety-offline",
      icon: AlertTriangle,
      title: "7. Safety Disclaimer & Offline Meetings",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            While Prem Jodo conducts selfie verification and automated AI safety moderation, <strong className="text-zinc-900 dark:text-white">Prem Jodo does not conduct official criminal background checks</strong> on every user.
          </p>
          <p>
            You are solely responsible for your interactions with other users both on and off the platform. Please review our <Link href="/safety-tips" prefetch={false} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">Safety Guidelines</Link> and always meet in well-lit public venues, arrange your own transportation, and inform trusted friends or family.
          </p>
        </div>
      ),
    },
    {
      id: "liability-indemnity",
      icon: Scale,
      title: "8. Limitation of Liability & Indemnification",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            To the maximum extent permitted by applicable law, Prem Jodo, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, punitive, or consequential damages resulting from your use of or inability to use the Platform, or any conduct or content of any user or third party.
          </p>
          <p>
            You agree to defend, indemnify, and hold harmless Prem Jodo against any claims, damages, liabilities, and expenses arising from your breach of these Terms or violation of any applicable laws.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      icon: Scale,
      title: "9. Governing Law & Dispute Resolution",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
          </p>
          <p>
            Any legal dispute, suit, or proceeding arising out of or related to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-zinc-900 dark:text-white">New Delhi, India</strong>.
          </p>
        </div>
      ),
    },
    {
      id: "grievance-contact",
      icon: Mail,
      title: "10. Grievance Officer & Contact Information",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            In compliance with the Information Technology Act, 2000 and the rules made thereunder, the contact details of the Grievance Redressal Officer are as follows:
          </p>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
            <p className="poppins-bold text-zinc-900 dark:text-white">Grievance Redressal Officer</p>
            <p className="text-zinc-600 dark:text-zinc-400">Prem Jodo</p>
            <p className="text-zinc-600 dark:text-zinc-400">Email: <a href="mailto:officialsagarkumar43@gmail.com" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">officialsagarkumar43@gmail.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Contact Number: <a href="tel:+917087362399" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 7087362399</a></p>
            <p className="text-zinc-600 dark:text-zinc-400">Support Helpline: <a href="tel:+919625477336" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 9625477336</a></p>
            <p className="text-zinc-500 text-[11px] pt-1">Grievance Redressal SLA: Acknowledgment within 24 hours, resolution within 15 days.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              Prem Jodo <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Terms of Service</span>
            </h1>
            <p className="text-sm sm:text-base poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Please review these terms carefully. By using Prem Jodo, you agree to these legal obligations, billing guidelines, and community safety policies.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 poppins-medium pt-1">
              <span>Last Updated: <strong className="text-zinc-700 dark:text-zinc-300">September 2026</strong></span>
              <span>•</span>
              <span>Platform: <strong className="text-zinc-700 dark:text-zinc-300">Prem Jodo</strong></span>
            </div>
          </div>
        </section>

        {/* Navigation Quick Jump & Policy Sections */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl space-y-8">
            {/* Quick Policy Index Links */}
            <div className="hidden sm:block p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs poppins-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Key Policy Sections
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

            {/* Sections Content */}
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 scroll-mt-24 transition-all"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
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

            {/* Compliance Quick Links Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs poppins-semibold">
              <span className="text-zinc-600 dark:text-zinc-400">Related Legal & Merchant Compliance Policies:</span>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/privacy" prefetch={false} className="text-rose-600 dark:text-rose-400 hover:underline">Privacy Policy →</Link>
                <Link href="/refund-policy" prefetch={false} className="text-rose-600 dark:text-rose-400 hover:underline">Refund Policy →</Link>
                <Link href="/contact-us" prefetch={false} className="text-rose-600 dark:text-rose-400 hover:underline">Contact Us →</Link>
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
