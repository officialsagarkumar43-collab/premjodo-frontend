"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/common/AuthModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  PhoneCall,
  MapPin,
  CheckCircle2,
  MessageSquare,
  BadgeAlert,
} from "lucide-react";

export default function SafetyTipsPage() {
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

  const tipsCategories = [
    {
      category: "1. Online Messaging & Chatting",
      icon: MessageSquare,
      color: "rose",
      tips: [
        {
          title: "Keep conversations on the app",
          desc: "Never rush to move to WhatsApp, Telegram, or personal phone calls immediately. In-app messaging has automated spam and harassment filters to protect you.",
        },
        {
          title: "Look for the Blue Selfie Badge",
          desc: "Prioritize chatting with users whose profiles have verified blue badges. This ensures they have passed live 3D facial verification.",
        },
        {
          title: "Protect financial & sensitive information",
          desc: "Never send money, share bank details, UPI PINs, OTP codes, credit cards, or residential address with anyone you just met online.",
        },
        {
          title: "Beware of long-distance romance scams",
          desc: "Be extremely cautious if someone professes intense love immediately, claims to be stuck abroad, or asks for financial assistance for 'emergencies'.",
        },
      ],
    },
    {
      category: "2. Meeting in the Real World",
      icon: MapPin,
      color: "emerald",
      tips: [
        {
          title: "Always meet in a crowded public venue",
          desc: "Choose busy coffee shops, popular restaurants, or shopping malls for initial meetings. Avoid private residences, hotel rooms, or secluded outdoor spots.",
        },
        {
          title: "Tell a friend & share live location",
          desc: "Always let a close friend or family member know who you are meeting, the venue name, and what time you expect to return. Use WhatsApp or Google Maps live location.",
        },
        {
          title: "Control your own transportation",
          desc: "Drive your own vehicle or arrange your own cab (Uber/Ola). Never accept a ride from a newly met person on the first meeting so you can leave whenever you want.",
        },
        {
          title: "Keep your drinks and belongings in sight",
          desc: "Never leave your food or beverage unattended. If you step away to the restroom, order a fresh drink upon your return.",
        },
      ],
    },
    {
      category: "3. Recognizing Red Flags & Boundaries",
      icon: BadgeAlert,
      color: "amber",
      tips: [
        {
          title: "Pressure to do something uncomfortable",
          desc: "A genuine match respects your pace. If someone pressures you for physical intimacy, private photos, or personal data, step away immediately.",
        },
        {
          title: "Inconsistent stories or refusal to video call",
          desc: "If they constantly make excuses to avoid a quick 2-minute in-app video vibe check, they may be misrepresenting their identity.",
        },
        {
          title: "Trust your gut instincts",
          desc: "If something feels off or too good to be true, honor your intuition. You have every right to end a meeting or block a profile at any moment without feeling guilty.",
        },
      ],
    },
  ];

  const emergencyHelplines = [
    { title: "National Emergency Helpline", number: "112", desc: "Immediate police, medical, and fire response in India" },
    { title: "Women's Safety Helpline", number: "1091", desc: "Dedicated 24x7 women distress & safety support" },
    { title: "National Cyber Crime Portal", number: "1930", desc: "Report online fraud, sextortion, and cyber harassment" },
    { title: "Prem Jodo 24x7 Helpline", number: "+91 9625477336", desc: "Dedicated telephone assistance for safety & account issues" },
    { title: "Prem Jodo Rapid Safety Desk", number: "officialsagarkumar43@gmail.com", desc: "Priority in-app report review within 15 minutes" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 px-4 text-center overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl poppins-black tracking-tight text-zinc-900 dark:text-white">
              Essential <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">Meetup Safety Tips</span>
            </h1>
            <p className="text-sm sm:text-base poppins-regular text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Meeting new people should be respectful, transparent, and safe. Whether chatting online or meeting for coffee, here are our essential golden rules.
            </p>
          </div>
        </section>

        {/* Categorized Safety Tips */}
        <section className="py-12 sm:py-16">
          <div className="container max-w-4xl space-y-12">
            {tipsCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl poppins-bold text-zinc-900 dark:text-white">
                      {cat.category}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.tips.map((tip, tipIdx) => (
                      <div
                        key={tipIdx}
                        className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
                      >
                        <h3 className="text-sm poppins-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{tip.title}</span>
                        </h3>
                        <p className="text-xs poppins-regular text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                          {tip.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Emergency Helplines Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent border border-rose-200 dark:border-rose-900/40 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg poppins-bold text-zinc-900 dark:text-white">
                    Emergency Helplines & Safety Resources
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    If you ever feel in immediate danger or face cyber harassment, help is readily available.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emergencyHelplines.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs poppins-bold text-zinc-700 dark:text-zinc-300">{item.title}</span>
                      <span className="text-xs poppins-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                        {item.number}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* In-App Report Prompt */}
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <p className="poppins-bold text-zinc-900 dark:text-white">Experienced inappropriate behavior?</p>
                <p className="text-zinc-500">Tap the three dots on any user&apos;s card or chat to report and block them immediately.</p>
              </div>
              <Link
                href="/support"
                prefetch={false}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 poppins-bold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
              >
                Contact Support Desk →
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
