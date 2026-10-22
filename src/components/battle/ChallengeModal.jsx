"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Swords,
  ShieldCheck,
  Sparkles,
  X,
  Copy,
  Check,
  Share2,
  Users,
  Flame,
  ArrowRight,
  Crown,
  Clock,
  Zap,
} from "lucide-react";

import battleService from "@/lib/services/battle.service";

export default function ChallengeModal({
  isOpen,
  opponent,
  myUserId,
  stake = 50,
  prize = 90,
  roomCode = "LUDO-7890",
  onStartGame,
  onCancel,
}) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(25);
  const [hasOpponentAccepted, setHasOpponentAccepted] = useState(false);
  const [startCountdown, setStartCountdown] = useState(null);
  const [isDeclined, setIsDeclined] = useState(false);

  const onStartGameRef = useRef(onStartGame);
  onStartGameRef.current = onStartGame;

  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const opponentRef = useRef(opponent);
  opponentRef.current = opponent;

  useEffect(() => {
    if (!isOpen) {
      setCountdown(25);
      setHasOpponentAccepted(false);
      setStartCountdown(null);
      setIsDeclined(false);
      return;
    }

    setHasOpponentAccepted(false);
    setStartCountdown(null);
    setIsDeclined(false);

    // Live socket listener for opponent acceptance
    const bSock = battleService.getBattleSocket();
    const rSock = battleService.getSocket();

    const normalizedRoom = String(roomCode || "").trim().toUpperCase();
    const currentHostId = String(myUserId || "").trim();

    if (bSock && normalizedRoom) {
      bSock.emit("battle:join_room", { userId: currentHostId, roomId: normalizedRoom, roomCode: normalizedRoom });
      bSock.emit("join_room", { roomId: normalizedRoom, roomCode: normalizedRoom });
    }
    if (rSock && rSock !== bSock && normalizedRoom) {
      rSock.emit("battle:join_room", { userId: currentHostId, roomId: normalizedRoom, roomCode: normalizedRoom });
      rSock.emit("join_room", { roomId: normalizedRoom, roomCode: normalizedRoom });
    }

    const handleOpponentAccepted = (data) => {
      if (!data) return;
      console.log("⚔️ [Live Opponent Accepted Challenge in Modal]:", data);
      const incomingRoom = String(data?.roomId || data?.roomCode || data?.room?.roomId || "").trim().toUpperCase();
      if (incomingRoom && normalizedRoom && incomingRoom !== normalizedRoom) return;

      const cleanHostId = String(currentHostId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      // Extract incoming remote opponent safely
      let oppData = null;
      const joinedId = String(data?.joinedPlayer?.userId || data?.joinedPlayer?._id || data?.joinedPlayer?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const detailsId = String(data?.userDetails?.userId || data?.userDetails?._id || data?.userDetails?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const oppId = String(data?.opponent?.userId || data?.opponent?._id || data?.opponent?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      if (data?.joinedPlayer && joinedId && joinedId !== cleanHostId) {
        oppData = data.joinedPlayer;
      } else if (data?.userDetails && detailsId && detailsId !== cleanHostId) {
        oppData = data.userDetails;
      } else if (data?.opponent && oppId && oppId !== cleanHostId) {
        if (data?.isAccepted || data?.accepted || data?.status === "ACCEPTED" || data?.action === "accept") {
          oppData = data.opponent;
        }
      }

      // Check if event is an explicit challenge accept by the guest
      const isExplicitAccept = Boolean(
        data?.accepted ||
        data?.isAccepted ||
        data?.status === "ACCEPTED" ||
        data?.type === "CHALLENGE_ACCEPTED" ||
        data?.event === "challenge_accepted" ||
        data?.event === "battle:challenge_accepted" ||
        data?.event === "opponent_accepted" ||
        data?.event === "battle:opponent_accepted"
      );

      // Check actor ID - if the actor is the host themselves (e.g. echo on challenge send), ignore!
      const actorId = String(
        data?.userId ||
        data?.challenger?.userId ||
        data?.challenger?._id ||
        data?.challenger ||
        ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      if (actorId && cleanHostId && actorId === cleanHostId && !isExplicitAccept) {
        return;
      }

      // STRICT: Must have either a valid remote oppData OR explicit accept from remote player
      if (!oppData && !isExplicitAccept) {
        return;
      }

      if (!oppData) {
        oppData = opponentRef.current;
      }

      const finalOppId = String(oppData?.userId || oppData?._id || oppData?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      if (finalOppId && cleanHostId && finalOppId === cleanHostId) {
        return;
      }

      setHasOpponentAccepted(true);
      setIsDeclined(false);
      setStartCountdown(1);

      setTimeout(() => {
        if (onStartGameRef.current) {
          onStartGameRef.current(oppData, stake, roomCode);
        }
      }, 400);
    };

    const handlePlayerRejected = (data) => {
      console.log("❌ [Opponent Declined Challenge]:", data);
      const incomingRoom = String(data?.roomId || data?.roomCode || "").trim().toUpperCase();
      if (!incomingRoom || incomingRoom === normalizedRoom) {
        setIsDeclined(true);
        setStartCountdown(null);
        setTimeout(() => {
          if (onCancelRef.current) onCancelRef.current();
        }, 1200);
      }
    };

    // Listen ONLY for genuine opponent accept and decline events
    const joinEvents = [
      "battle:challenge_accepted",
      "challenge_accepted",
      "battle:opponent_accepted",
      "opponent_accepted",
      "battle:opponent_entered_code",
    ];
    const rejectEvents = [
      "battle:challenge_rejected",
      "battle:challenge_declined",
      "challenge_rejected",
      "challenge_declined",
      "battle:rejected",
      "battle:declined",
    ];

    if (bSock) {
      joinEvents.forEach((evt) => bSock.on(evt, handleOpponentAccepted));
      rejectEvents.forEach((evt) => bSock.on(evt, handlePlayerRejected));
    }
    if (rSock && rSock !== bSock) {
      joinEvents.forEach((evt) => rSock.on(evt, handleOpponentAccepted));
      rejectEvents.forEach((evt) => rSock.on(evt, handlePlayerRejected));
    }

    // Live countdown timer for modal auto-expiry
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            if (onCancelRef.current) onCancelRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (bSock) {
        joinEvents.forEach((evt) => bSock.off(evt, handleOpponentAccepted));
        rejectEvents.forEach((evt) => bSock.off(evt, handlePlayerRejected));
      }
      if (rSock && rSock !== bSock) {
        joinEvents.forEach((evt) => rSock.off(evt, handleOpponentAccepted));
        rejectEvents.forEach((evt) => rSock.off(evt, handlePlayerRejected));
      }
    };
  }, [isOpen, roomCode, myUserId, stake]);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Join my 1v1 Ludo Cash Battle on Prem Jodo! Stake: ₹${stake}, Prize: ₹${prize}. Enter Room Code: ${roomCode} 👉 ${window.location.origin}/user/battle`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!isOpen || !opponent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl shadow-2xl border-2 border-rose-500/30 dark:border-purple-500/40 overflow-hidden z-10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Top Cancel button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1v1 Stake Badge */}
        <div className="px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs font-bold mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
          <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>1v1 Room Challenge</span>
          <span>•</span>
          <span>Stake: ₹{stake}</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Prize: ₹{prize}</span>
        </div>

        {/* Players VS Matchup Header */}
        <div className="w-full flex items-center justify-around py-3 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 mb-5">
          {/* You */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white font-black text-xs">
                  YOU
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white mt-1.5">You (Host)</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Entry: ₹{stake}</span>
          </div>

          {/* VS Icon */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-rose-500/40 animate-pulse">
              VS
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">1v1 BATTLE</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={opponent.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={opponent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 animate-ping" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white mt-1.5 max-w-[90px] truncate">{opponent.name}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{opponent.city || "Online"}</span>
          </div>
        </div>

        {/* Generated Room Code Box */}
        <div className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 mb-4 flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-1">
            Generated Battle Room Code
          </span>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-black text-rose-600 dark:text-rose-400 tracking-widest">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            Opponent receives this room code in their invite popup to join your battle.
          </p>
        </div>

        {/* Live Opponent Status / Challenge State */}
        {isDeclined ? (
          /* Opponent Declined State */
          <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/50 mb-5 flex items-center justify-between animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <X className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-700 dark:text-rose-300">
                  {opponent.name} Declined Challenge
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Opponent is currently busy. Closing invite...
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-full cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        ) : !hasOpponentAccepted ? (
          /* Waiting for Opponent to Accept */
          <div className="w-full p-4 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/60 border border-amber-200 dark:border-zinc-700/80 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>Sending invite to {opponent.name}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Waiting for opponent to accept & enter room code
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Waiting</span>
            </div>
          </div>
        ) : (
          /* Opponent Accepted / Room Code Entered State - 3, 2, 1 COUNTDOWN ACTIVE */
          <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 mb-5 flex items-center justify-between animate-in zoom-in-95 shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-2xl animate-bounce shadow-md">
                {startCountdown !== null && startCountdown > 0 ? startCountdown : "🚀"}
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>🎉 {opponent.name} Accepted Challenge!</span>
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-200 mt-0.5">
                  Starting 1v1 Battle Arena in <strong className="text-amber-600 dark:text-amber-300">{startCountdown || 1}s</strong>...
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-white bg-emerald-600 px-3 py-1 rounded-full animate-pulse">
              {startCountdown !== null && startCountdown > 0 ? `${startCountdown}s` : "GO!"}
            </span>
          </div>
        )}

        {/* Opponent Real-Time Simulation Prompt / Action Bar */}
        <div className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-left mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Opponent Screen Notification
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Socket Active
            </span>
          </div>
          <p className="text-[11px] text-zinc-700 dark:text-zinc-200 leading-snug">
            &quot;<strong>{opponent.name}</strong> got notification: <em>Challenge from You (Stake: ₹{stake} • Room: {roomCode})</em>&quot;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleShareWhatsApp}
            type="button"
            className="w-full sm:w-1/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Code</span>
          </button>

          <button
            type="button"
            disabled={!hasOpponentAccepted || (startCountdown !== null && startCountdown > 0)}
            onClick={() => onStartGame(opponent, stake, roomCode)}
            className={`w-full sm:w-2/3 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              hasOpponentAccepted
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-white shadow-lg shadow-emerald-500/30 active:scale-98 cursor-pointer animate-pulse"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-75"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>
              {hasOpponentAccepted
                ? `Starting Battle in ${startCountdown || 1}... ⚔️`
                : `Waiting for ${opponent.name?.split(" ")[0] || "Opponent"} to accept...`}
            </span>
            {hasOpponentAccepted && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
