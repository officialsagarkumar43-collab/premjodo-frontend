"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Trash2,
  Mail,
  Sparkles,
  CreditCard,
  Building2,
  Cookie,
  FileCheck,
} from "lucide-react";

export default function PrivacyPolicyPage() {
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
      id: "collection",
      icon: Database,
      title: "1. Information We Collect",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-900 dark:text-white">Prem Jodo</strong> ("Prem Jodo", "we", "our", or "us") respects your personal privacy. We collect the following categories of information to provide, personalize, and protect our matchmaking services:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Account & Profile Information:</strong> Name, phone number, email address, date of birth, gender identity, relationship preferences, photographs, bio, education, occupation, and hobbies.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Biometric Selfie Verification:</strong> Optional live 3D selfie scans to award verified profile badges and prevent bot impersonation. Biometric vectors are strictly utilized for authentication and never sold or shared with commercial data brokers.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Geolocation Data:</strong> With your explicit device permission, we collect precise and approximate GPS coordinates to calculate proximity with potential matches and adjust discovery filters.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Usage & Technical Logs:</strong> Device model, IP address, operating system, browser type, app crashes, interaction timestamps, swipe logs, and security audit logs.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Communication & Chats:</strong> Messages, voice notes, and media exchanged inside the app to detect safety violations, prevent harassment, and deliver customer support.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "payment-security",
      icon: CreditCard,
      title: "2. Payment Information & Financial Data Security",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            We adhere to the highest international and Reserve Bank of India (RBI) payment security directives:
          </p>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 poppins-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero Financial Credential Storage on Prem Jodo Servers</span>
            </div>
            <p className="text-emerald-800/90 dark:text-emerald-300">
              Prem Jodo <strong className="underline">never</strong> collects, stores, or processes sensitive payment card details (16-digit card number, CVV/CVC, expiration date, ATM PIN) or Net Banking credentials or UPI PINs.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Authorized Payment Gateways:</strong> All billing transactions are encrypted and processed through RBI-authorized, PCI-DSS Level 1 certified payment aggregators and gateway partners using tokenization and 256-bit SSL encryption.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Transaction Identifiers:</strong> We only receive tokenized reference identifiers (e.g., Order ID, Payment ID, transaction status, billing amount, and plan validity) to activate your subscriptions and maintain statutory billing records.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage-purpose",
      icon: Sparkles,
      title: "3. Purpose and Legal Basis for Processing",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>We process your data for lawful, transparent, and defined purposes only:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>To operate our <strong className="text-zinc-800 dark:text-zinc-200">Smart Compatibility Matching Engine</strong> and recommend relevant singles based on shared compatibility.</li>
            <li>To authenticate users, grant verified blue badges, and eliminate fake accounts or romance scammers.</li>
            <li>To process VIP subscriptions, virtual coin top-ups, and generate invoices.</li>
            <li>To enforce our Terms of Service, investigate community reports, and ensure safety.</li>
            <li>To send critical account alerts, verification OTPs, customer support responses, and service updates.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "security-retention",
      icon: Lock,
      title: "4. Data Security, Encryption & Retention",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            We implement robust administrative, technical, and physical safeguards to protect your personal data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Encryption:</strong> All personal data is encrypted at rest using <strong className="text-zinc-900 dark:text-white">AES-256 bit encryption</strong> and in transit across public networks using <strong className="text-zinc-900 dark:text-white">TLS 1.3</strong>.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Access Control:</strong> Access to user database records is restricted strictly to authorized engineering and safety personnel on a need-to-know basis with multi-factor authentication.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Retention Period:</strong> We retain your personal information for as long as your account remains active. Upon account deletion, your personal profile, photos, and messages are permanently expunged from active production systems within 30 days.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "sharing",
      icon: Eye,
      title: "5. Information Sharing & Third-Party Disclosures",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-900 dark:text-white">Prem Jodo does NOT sell, rent, or trade your personal profile data to advertisers or third-party brokers.</strong>
          </p>
          <p>We disclose information only under strict confidentiality safeguards to:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Matched Members:</strong> Public profile details (first name, age, distance, bio, verified badge status, interests) are displayed to other members.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Infrastructure & Service Providers:</strong> Trusted cloud hosting partners (AWS/GCP), SMS/Email OTP verification vendors, and payment gateways strictly under data processing agreements.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Legal & Regulatory Compliance:</strong> When required by Indian law, judicial court orders, or law enforcement warrants, or to prevent imminent physical harm.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "cookies",
      icon: Cookie,
      title: "6. Cookies & Tracking Technologies",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            We use essential cookies, session storage, and analytics tokens to keep you logged in, remember your preferences, and analyze platform performance. You can manage or disable non-essential cookies through your browser settings.
          </p>
        </div>
      ),
    },
    {
      id: "rights",
      icon: Trash2,
      title: "7. Your Rights & Data Deletion",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>You have extensive rights regarding your personal information:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-zinc-800 dark:text-zinc-200">Right to Access & Rectify:</strong> You can review, update, or edit your profile information directly in the App at any time.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Right to Erasure (Delete Account):</strong> You can permanently delete your account via Profile &gt; Settings &gt; Delete Account. All your photos, chats, and matches are permanently deleted within 30 days.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Pause / Snooze Mode:</strong> Temporarily hide your card from discovery without deleting existing conversations.</li>
            <li><strong className="text-zinc-800 dark:text-zinc-200">Data Portability:</strong> You may request an electronic copy of your account data by writing to our Data Protection Officer.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "grievance-dpo",
      icon: Mail,
      title: "8. Statutory Grievance Redressal Officer & Contact",
      content: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            In accordance with the Information Technology Act, 2000 and Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011:
          </p>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
            <p className="poppins-bold text-zinc-900 dark:text-white">Grievance & Data Protection Officer</p>
            <p className="text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Name:</strong> Grievance Redressal Officer</p>
            <p className="text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Entity:</strong> Prem Jodo</p>
            <p className="text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Email:</strong> <a href="mailto:officialsagarkumar43@gmail.com" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">officialsagarkumar43@gmail.com</a></p>
            <p className="text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Contact Number:</strong> <a href="tel:+917087362399" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 7087362399</a></p>
            <p className="text-zinc-600 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Helpline:</strong> <a href="tel:+919625477336" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">+91 9625477336</a></p>
            <p className="text-zinc-500 text-[11px] pt-1">Response Timelines: Acknowledgment within 24 to 48 hours; final resolution within 15 to 30 days.</p>
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
        <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              Prem Jodo <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Privacy Policy</span>
            </h1>
            <p className="text-sm sm:text-base poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Your trust is our cornerstone. Learn how we protect your personal information, handle secure transactions, and safeguard your platform experience.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 poppins-medium pt-1">
              <span>Last Updated: <strong className="text-zinc-700 dark:text-zinc-300">September 2026</strong></span>
              <span>•</span>
              <span>Platform: <strong className="text-zinc-700 dark:text-zinc-300">Prem Jodo</strong></span>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl space-y-8">
            {/* Quick Nav Bar */}
            <div className="hidden sm:block p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs poppins-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Key Privacy Sections
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

            {/* Quick Links Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs poppins-semibold">
              <span className="text-zinc-600 dark:text-zinc-400">Related Legal & Merchant Compliance Policies:</span>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/terms" prefetch={false} className="text-rose-600 dark:text-rose-400 hover:underline">Terms of Service →</Link>
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
