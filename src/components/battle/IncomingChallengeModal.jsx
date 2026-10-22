"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swords, X, Crown, ShieldCheck, Sparkles, Zap, Flame, Trophy, Volume2 } from "lucide-react";
import battleService from "@/lib/services/battle.service";

export default function IncomingChallengeModal({
  isOpen,
  challengeData,
  onAccept,
  onDecline,
}) {
  const [countdown, setCountdown] = useState(20);
  const [isAccepted, setIsAccepted] = useState(false);
  const [startCountdown, setStartCountdown] = useState(null);
  const audioCtxRef = useRef(null);
  const onDeclineRef = useRef(onDecline);
  onDeclineRef.current = onDecline;

  const challenger =
    typeof challengeData?.challenger === "object" && challengeData.challenger !== null
      ? challengeData.challenger
      : {};
  const stake = Number(challengeData?.stakeAmount || challengeData?.stake || 50);
  const prize = Number(challengeData?.prizeAmount || challengeData?.prize || Math.floor(stake * 1.8));
  const roomCode = challengeData?.roomId || challengeData?.roomCode;

  const challengerId =
    challenger?.userId ||
    challenger?._id ||
    challenger?.id ||
    (typeof challengeData?.challenger === "string" ? challengeData.challenger : null) ||
    challengeData?.challengerUserId ||
    challengeData?.hostUserId ||
    challengeData?.creator?._id ||
    challengeData?.creator?.id ||
    (typeof challengeData?.creator === "string" ? challengeData.creator : null);

  let challengerName =
    challenger?.name ||
    challenger?.fullName ||
    challenger?.username ||
    challengeData?.challengerName ||
    challengeData?.hostName ||
    challengeData?.creatorName ||
    challengeData?.creator?.fullName ||
    challengeData?.creator?.name ||
    challengeData?.players?.[0]?.name ||
    challengeData?.players?.[0]?.fullName ||
    challengeData?.name;

  if (!challengerName || challengerName.toLowerCase() === "user" || challengerName.toLowerCase() === "player" || challengerName.toLowerCase() === "a challenger") {
    if (challengerId) {
      const cleanId = String(challengerId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const matchedPlayer = battleService.getOnlineOpponents().find((p) => {
        const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        return pId && cleanId && pId === cleanId;
      });
      if (matchedPlayer && (matchedPlayer.name || matchedPlayer.fullName)) {
        challengerName = matchedPlayer.name || matchedPlayer.fullName;
      }
      if (!challengerName || challengerName.toLowerCase() === "user") {
        const matchedRoom = battleService.getActiveRooms().find((r) => {
          const rHostId = String(r.hostUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
          return (rHostId && cleanId && rHostId === cleanId) || (r.roomCode && roomCode && r.roomCode === roomCode);
        });
        if (matchedRoom && matchedRoom.hostName) {
          challengerName = matchedRoom.hostName;
        }
      }
    }
  }

  if (!challengerName || challengerName.toLowerCase() === "user") {
    challengerName = "Live Opponent";
  }

  let challengerAvatar =
    challenger?.avatar ||
    challenger?.photos?.[0]?.url ||
    challenger?.photos?.[0] ||
    challenger?.photo ||
    challengeData?.challengerAvatar ||
    challengeData?.hostAvatar ||
    challengeData?.creatorAvatar ||
    challengeData?.creator?.avatar ||
    challengeData?.players?.[0]?.avatar;

  if (!challengerAvatar || challengerAvatar.includes("undefined")) {
    if (challengerId) {
      const cleanId = String(challengerId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const matchedPlayer = battleService.getOnlineOpponents().find((p) => {
        const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        return pId && cleanId && pId === cleanId;
      });
      if (matchedPlayer && matchedPlayer.avatar) {
        challengerAvatar = matchedPlayer.avatar;
      }
    }
  }

  if (!challengerAvatar) {
    challengerAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
  }

  // Play attention chime on challenge popup
  useEffect(() => {
    if (!isOpen) {
      setCountdown(20);
      setIsAccepted(false);
      setStartCountdown(null);
      return;
    }

    setCountdown(20);
    setIsAccepted(false);
    setStartCountdown(null);

    try {
      if (typeof window !== "undefined") {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch { }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            if (onDeclineRef.current) onDeclineRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleAccept = () => {
    if (isAccepted) return;
    setIsAccepted(true);
    setStartCountdown(3);

    // Play accept beep
    try {
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {}

    let currentSec = 3;
    const cdInterval = setInterval(() => {
      currentSec -= 1;
      setStartCountdown(currentSec);
      if (currentSec <= 0) {
        clearInterval(cdInterval);
        if (onAccept) {
          onAccept(challengeData);
        }
      }
    }, 1000);
  };

  if (!isOpen || !challengeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
        onClick={!isAccepted ? onDecline : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl shadow-2xl border-2 border-rose-500/40 dark:border-rose-500/60 overflow-hidden z-10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        {!isAccepted && (
          <button
            type="button"
            onClick={onDecline}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Incoming Challenge Badge */}
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 shadow-xs animate-pulse">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>{isAccepted ? "Challenge Accepted!" : "Incoming 1v1 Battle Challenge!"}</span>
        </div>

        {/* Challenger Avatar with Radar Glow */}
        <div className="relative my-2">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping duration-1000" />
          <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-xl">
            <img
              src={challengerAvatar}
              alt={challengerName}
              className="w-full h-full rounded-full object-cover border-2 border-white/40"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-zinc-900 shadow">
            ONLINE
          </div>
        </div>

        {/* Challenger Info */}
        <h3 className="text-xl poppins-bold text-zinc-900 dark:text-white mt-2">
          {challengerName}
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
          Has challenged you to a <strong>1 vs 1 Ludo Match</strong>!
        </p>

        {/* Stake & Prize Pool Details */}
        <div className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 my-4 flex items-center justify-around">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
              Entry Stake
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              ₹{stake}
            </span>
          </div>

          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
              Winner Takes
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              ₹{prize}
            </span>
          </div>

          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
              Room
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {roomCode}
            </span>
          </div>
        </div>

        {/* 3, 2, 1 Countdown Overlay if Accepted */}
        {isAccepted ? (
          <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 my-2 flex items-center justify-between animate-in zoom-in-95 shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-2xl animate-bounce shadow-md">
                {startCountdown !== null && startCountdown > 0 ? startCountdown : "🚀"}
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                  Challenge Accepted!
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-200 mt-0.5">
                  Entering Battle Arena in <strong className="text-amber-600 dark:text-amber-300">{startCountdown || 1}s</strong>...
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-white bg-emerald-600 px-3 py-1 rounded-full animate-pulse">
              {startCountdown !== null && startCountdown > 0 ? `${startCountdown}s` : "GO!"}
            </span>
          </div>
        ) : (
          /* Auto-expiry Countdown Bar */
          <div className="w-full mb-5 flex items-center justify-between px-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Auto-expires in:</span>
            <span className="font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20">
              {countdown}s
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!isAccepted && (
          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="w-1/3 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Accept & Play Battle ⚔️</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
