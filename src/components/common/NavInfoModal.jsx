"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Sparkles,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  Download,
  Calendar,
  CheckCircle2,
  Heart,
  Smartphone,
  QrCode,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Lock,
} from "lucide-react";

export function NavInfoModal({ isOpen, type, onClose, onOpenAuth }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportQuery, setSupportQuery] = useState("");

  if (!isOpen || !type) return null;

  const handleOpenAuth = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/user");
      return;
    }
    if (onOpenAuth) onOpenAuth("register");
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (supportEmail && supportQuery) {
      setSupportMessageSent(true);
      setTimeout(() => {
        setSupportMessageSent(false);
        setSupportEmail("");
        setSupportQuery("");
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              {type === "product" && <Sparkles className="w-5 h-5" />}
              {type === "subscriptions" && <CreditCard className="w-5 h-5" />}
              {type === "safety" && <ShieldCheck className="w-5 h-5" />}
              {type === "support" && <HelpCircle className="w-5 h-5" />}
              {type === "download" && <Download className="w-5 h-5" />}
              {type === "events" && <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl poppins-bold text-zinc-900 dark:text-white capitalize">
                {type === "product" && "Prem Jodo Features"}
                {type === "subscriptions" && "Prem Jodo Premium Plans"}
                {type === "safety" && "Safety & Trust Center"}
                {type === "support" && "Help & Support"}
                {type === "download" && "Get Prem Jodo App"}
                {type === "events" && "Singles Events & Meetups"}
              </h2>
              <p className="text-xs poppins-regular text-zinc-500 dark:text-zinc-400">
                {type === "product" && "Experience authentic social networking built for meaningful connections"}
                {type === "subscriptions" && "Upgrade your platform experience with exclusive superpowers"}
                {type === "safety" && "Your privacy, dignity, and real-world safety are our priority"}
                {type === "support" && "Frequently asked questions and 24x7 customer assistance"}
                {type === "download" && "Available on iOS and Android devices across India"}
                {type === "events" && "Curated real-world and virtual mixers for verified members"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* ================= 1. PRODUCT ================= */}
          {type === "product" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Smart Compatibility Matching</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    AI-powered matchmaking based on shared interests, humor, regional values, and relationship intent.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Selfie Verification</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Say goodbye to catfishes and bot profiles. Verified blue badges guarantee genuine members.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Voice & Icebreakers</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Send fun voice notes and answer icebreaker prompts to skip boring &quot;Hi/Hello&quot; chats.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Incognito & Safety</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Full control over your visibility. Browse anonymously and only be seen by people you like.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="poppins-bold text-sm">Ready to meet someone special?</h4>
                  <p className="text-xs text-zinc-400">Join thousands of verified singles on Prem Jodo today.</p>
                </div>
                <button
                  onClick={handleOpenAuth}
                  className="px-5 py-2.5 rounded-full text-xs poppins-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg hover:opacity-95 whitespace-nowrap cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ================= 2. SUBSCRIPTIONS ================= */}
          {type === "subscriptions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Plus Plan */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      Plus
                    </span>
                    <div className="mt-3">
                      <span className="text-2xl poppins-black text-zinc-900 dark:text-white">₹299</span>
                      <span className="text-xs text-zinc-500"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>Unlimited Swipes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>Rewind Last Swipe</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>5 Free Super Likes / week</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="mt-6 w-full py-2.5 rounded-xl text-xs poppins-bold bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-900 dark:text-white transition-all cursor-pointer"
                  >
                    Select Plus
                  </button>
                </div>

                {/* Gold Plan (Recommended) */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border-2 border-amber-500/50 flex flex-col justify-between shadow-lg">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] poppins-bold uppercase px-3 py-0.5 rounded-full bg-amber-500 text-black">
                    Most Popular
                  </span>
                  <div>
                    <span className="text-[11px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Gold
                    </span>
                    <div className="mt-3">
                      <span className="text-2xl poppins-black text-zinc-900 dark:text-white">₹599</span>
                      <span className="text-xs text-zinc-500"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>See Who Liked You</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>1 Free Profile Boost / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>All Plus Features</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="mt-6 w-full py-2.5 rounded-xl text-xs poppins-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold shadow-md transition-all cursor-pointer"
                  >
                    Select Gold
                  </button>
                </div>

                {/* Platinum Plan */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      Platinum
                    </span>
                    <div className="mt-3">
                      <span className="text-2xl poppins-black text-zinc-900 dark:text-white">₹999</span>
                      <span className="text-xs text-zinc-500"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>Priority Swipes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>Message Before Matching</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>All Gold Features</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="mt-6 w-full py-2.5 rounded-xl text-xs poppins-bold bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95 shadow-md transition-all cursor-pointer"
                  >
                    Select Platinum
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. SAFETY ================= */}
          {type === "safety" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="poppins-bold text-sm text-emerald-900 dark:text-emerald-200">
                    Zero Tolerance for Harassment & Fake Profiles
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                    Prem Jodo is built on mutual respect and consent. Any violation of our community safety guidelines results in immediate permanent device ban.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs poppins-bold uppercase tracking-wider text-zinc-400">Essential Meetup Safety Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-900 dark:text-white">☕ Always meet in public first</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Meet at well-lit cafes, restaurants, or shopping centers.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-900 dark:text-white">📍 Share meetup plans with a friend</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Let your family or friends know who you are meeting and where.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-900 dark:text-white">🚫 Never send money or OTP</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Never transfer funds or financial information to anyone on social networking platforms.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-900 dark:text-white">🚨 24/7 Block & Report</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Easily report suspicious behavior directly inside any chat or profile.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. SUPPORT ================= */}
          {type === "support" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs poppins-bold uppercase tracking-wider text-zinc-400">Quick Help & FAQs</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-800 dark:text-zinc-200">How does Selfie Verification work?</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Take a quick real-time video pose. Our automated verification confirms you match your profile photos within 60 seconds.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-xs poppins-semibold text-zinc-800 dark:text-zinc-200">How can I change my location or distance radius?</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Go to your Profile &gt; Filters &gt; Distance to adjust your desired discovery range up to 100 km.</p>
                  </div>
                </div>
              </div>

              {/* Direct Support Contact Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700">
                <h4 className="text-xs poppins-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-rose-500" />
                  Contact 24x7 Help Desk
                </h4>
                {supportMessageSent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs poppins-semibold text-center">
                    ✓ Your message has been received! Our support team will reply within 2 hours.
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-2.5">
                    <input
                      type="email"
                      required
                      placeholder="Your email address"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="How can we assist you today?"
                      value={supportQuery}
                      onChange={(e) => setSupportQuery(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl text-xs poppins-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    >
                      Send Support Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ================= 5. DOWNLOAD ================= */}
          {type === "download" && (
            <div className="space-y-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <div className="p-3 bg-white dark:bg-white rounded-2xl shadow-md">
                  {/* QR code simulation */}
                  <div className="w-32 h-32 bg-zinc-100 rounded-xl flex flex-col items-center justify-center text-zinc-900 border border-zinc-300">
                    <QrCode className="w-20 h-20 text-zinc-900" />
                    <span className="text-[9px] font-bold text-zinc-700 mt-1">Scan to Download</span>
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-3">
                  <div>
                    <h3 className="poppins-bold text-base text-zinc-900 dark:text-white">Prem Jodo Mobile App</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Scan this QR code with your mobile camera to get the app.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={handleOpenAuth}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs poppins-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-md cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      Google Play Store
                    </button>
                    <button
                      onClick={handleOpenAuth}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs poppins-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-md cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      Apple App Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. EVENTS ================= */}
          {type === "events" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Join verified Prem Jodo community singles events in your city or attend virtual networking mixers:
              </p>

              <div className="space-y-3">
                {/* Event 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        In-Person
                      </span>
                      <h4 className="poppins-bold text-sm text-zinc-900 dark:text-white">Prem Jodo Sunset Coffee Mixer</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> Bandra West, Mumbai</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" /> This Saturday, 5:30 PM</span>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="px-4 py-2 rounded-xl text-xs poppins-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer self-start sm:self-center"
                  >
                    RSVP Free
                  </button>
                </div>

                {/* Event 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        Live Music
                      </span>
                      <h4 className="poppins-bold text-sm text-zinc-900 dark:text-white">Indie Acoustic Singles Night</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> Indiranagar, Bengaluru</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" /> Friday, 8:00 PM</span>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="px-4 py-2 rounded-xl text-xs poppins-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-colors cursor-pointer self-start sm:self-center"
                  >
                    Join Guestlist
                  </button>
                </div>

                {/* Event 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] poppins-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        Virtual
                      </span>
                      <h4 className="poppins-bold text-sm text-zinc-900 dark:text-white">Nationwide 3-Minute Vibe Checks</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-purple-500" /> In-App Video Mixer</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" /> Wednesday, 9:00 PM</span>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAuth}
                    className="px-4 py-2 rounded-xl text-xs poppins-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer self-start sm:self-center"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
