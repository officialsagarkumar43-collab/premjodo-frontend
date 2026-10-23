"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Crown,
  Clock,
  Sparkles,
  RotateCcw,
  Eye,
  Star,
  Zap,
  ArrowRight,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export function SwipeLimitModal({
  isOpen = false,
  onClose,
  dailyLimit = 50,
  swipesRemaining = 0,
  countdown = { hours: 0, minutes: 0, seconds: 0, formatted: "00:00:00" },
  customMessage = "",
}) {
  const router = useRouter();

  // Determine if this is a warning alert (e.g. 10 swipes left) or hard limit (0 left)
  const isWarning = typeof swipesRemaining === "number" && swipesRemaining > 0;

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose?.();
    router.push("/user/subscriptions?tab=plans");
  };

  const pad = (n) => String(n ?? 0).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dark Translucent Backdrop with Blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="swipe-limit-title"
        className="relative w-full max-w-md bg-zinc-950 text-white rounded-3xl border border-zinc-800/90 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-250 flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Top Decorative Gradient Glow */}
        <div
          className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${
            isWarning
              ? "from-amber-500/25 via-rose-500/10 to-transparent"
              : "from-rose-500/20 via-amber-500/10 to-transparent"
          } pointer-events-none`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-700/60 transition-all cursor-pointer shadow-md"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto no-scrollbar space-y-5">
          {/* Flame / Crown Animated Icon */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative mb-3">
              <div
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr ${
                  isWarning
                    ? "from-amber-400 via-orange-500 to-rose-500 shadow-amber-500/25"
                    : "from-rose-500 via-amber-500 to-pink-500 shadow-rose-500/25"
                } p-0.5 shadow-xl`}
              >
                <div className="w-full h-full rounded-[22px] bg-zinc-950 flex items-center justify-center">
                  {isWarning ? (
                    <Flame className="w-9 h-9 text-amber-400 animate-pulse fill-amber-400/30" />
                  ) : (
                    <Flame className="w-9 h-9 text-rose-500 animate-pulse fill-rose-500/30" />
                  )}
                </div>
              </div>
              <span
                className={`absolute -top-1 -right-1 px-1.5 min-w-[24px] h-6 rounded-full ${
                  isWarning
                    ? "bg-amber-400 text-zinc-950"
                    : "bg-rose-500 text-white"
                } font-black text-[11px] flex items-center justify-center shadow-md`}
              >
                {isWarning ? swipesRemaining : 0}
              </span>
            </div>

            <h2
              id="swipe-limit-title"
              className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2"
            >
              {isWarning ? (
                <>
                  <span>Only {swipesRemaining} Swipes Left Today!</span>
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400 inline" />
                </>
              ) : (
                <span>Daily Swipe Limit Reached</span>
              )}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xs leading-relaxed">
              {customMessage ||
                (isWarning
                  ? `You are down to your last ${swipesRemaining} free swipes for today. Upgrade to Prem Jodo VIP for Unlimited Swipes!`
                  : `You have used your free daily allowance of ${dailyLimit} swipes today.`)}
            </p>
          </div>

          {/* Countdown Timer to Midnight */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-inner flex flex-col items-center text-center space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Next Free Refill In</span>
            </div>

            {/* Segmented Digit Counters */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <span className="w-12 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-lg font-black text-white shadow-xs">
                  {pad(countdown.hours)}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                  Hours
                </span>
              </div>
              <span className="text-zinc-600 font-black text-lg pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="w-12 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-lg font-black text-white shadow-xs">
                  {pad(countdown.minutes)}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                  Mins
                </span>
              </div>
              <span className="text-zinc-600 font-black text-lg pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="w-12 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-lg font-black text-rose-400 shadow-xs">
                  {pad(countdown.seconds)}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                  Secs
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500">
              Daily quota resets automatically at 12:00 AM Midnight IST
            </p>
          </div>

          {/* VIP Upgrade Perks Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-purple-500/10 border border-rose-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                Prem Jodo VIP Membership
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[10px] uppercase">
                Save 33%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-zinc-200">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-bold">Unlimited Swipes:</strong> Swipe
                  as many matches as you like without daily limits.
                </span>
              </div>
              <div className="flex items-start gap-2 text-zinc-200">
                <RotateCcw className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-bold">Unlimited Rewinds:</strong> Undo
                  any accidental pass anytime.
                </span>
              </div>
              <div className="flex items-start gap-2 text-zinc-200">
                <Eye className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-bold">See Who Liked You:</strong> View
                  and match secret admirers instantly.
                </span>
              </div>
              <div className="flex items-start gap-2 text-zinc-200">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-bold">5 Free Super Likes</strong> every
                  single week.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleUpgrade}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-120 transition-transform" />
              <span>Upgrade to VIP — Unlimited Swipes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900 transition-colors text-center cursor-pointer"
            >
              {isWarning
                ? `Continue swiping (${swipesRemaining} left)`
                : "I'll check back tomorrow"}
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="py-2.5 px-6 bg-zinc-900/60 border-t border-zinc-800/60 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Cancel VIP anytime • Safe & encrypted payments</span>
        </div>
      </div>
    </div>
  );
}

export default SwipeLimitModal;
