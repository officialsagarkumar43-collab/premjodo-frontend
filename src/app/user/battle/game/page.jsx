"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, Swords, Crown, ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import LudoBoard from "@/components/battle/LudoBoard";
import battleService from "@/lib/services/battle.service";
import { useAuth } from "@/context/AuthContext";
import { isBattleReady } from "@/lib/common/featureFlags";

function GameArenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState("playing"); // "playing" | "game_over"
  const [gameResult, setGameResult] = useState(null); // { result: "WON" | "LOST", prize: number }

  // Extract query parameters
  const roomParam = searchParams.get("room");
  const stakeParam = parseInt(searchParams.get("stake") || "50", 10);
  const playersParam = parseInt(searchParams.get("players") || "4", 10);
  const prizeParam = parseInt(
    searchParams.get("prize") || `${battleService.calculatePrize(stakeParam, playersParam)}`,
    10
  );

  const roleParam = searchParams.get("role");
  const [isHost, setIsHost] = useState(roleParam ? roleParam === "host" : true);
  const [opponents, setOpponents] = useState([]);
  const [sessionUserProfile, setSessionUserProfile] = useState(null);

  useEffect(() => {
    setMounted(true);

    if (!isBattleReady) {
      router.replace("/user");
      return;
    }

    const myUserId = user?._id || user?.id || profile?._id || sessionUserProfile?.userId;
    const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    const cleanMyName = (profile?.fullName || user?.fullName || profile?.name || user?.name || sessionUserProfile?.name || "").trim().toLowerCase();

    // Retrieve active battle session if available, or generate opponents
    try {
      const sessionRaw = sessionStorage.getItem("pj_active_battle");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (typeof session.isHost !== "undefined") {
          setIsHost(Boolean(session.isHost));
        } else if (session.role) {
          setIsHost(session.role === "host");
        }
        if (session.userProfile) {
          setSessionUserProfile(session.userProfile);
        }
        if (session.opponents && session.opponents.length > 0) {
          const validOpponents = session.opponents.filter((p) => {
            const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
            const pName = (p.name || p.fullName || "").trim().toLowerCase();
            if (cleanMyId && pId && pId === cleanMyId) return false;
            if (cleanMyName && pName && pName === cleanMyName) return false;
            return true;
          });
          if (validOpponents.length > 0) {
            setOpponents(validOpponents);
            return;
          }
        }
      }
    } catch { }

    // Fallback: generate needed opponents strictly excluding current user
    const opponentsNeeded = Math.max(1, playersParam - 1);
    const matched = battleService.getMultipleOpponents(opponentsNeeded, cleanMyId);
    setOpponents(matched);
  }, [playersParam, roleParam, user, profile, sessionUserProfile?.userId, sessionUserProfile?.name]);

  // Handle Game Over
  const handleGameOver = useCallback(async (result, prize, details = {}) => {
    if (result === "WON") {
      await battleService.creditWinnings(prize, opponents[0], stakeParam, {
        roomId: roomParam,
        roomCode: roomParam,
        ...details,
      });
    } else {
      await battleService.recordLoss(opponents[0], stakeParam, {
        roomId: roomParam,
        roomCode: roomParam,
        ...details,
      });
    }
    setGameResult({ result, prize });
    setGameState("game_over");
  }, [opponents, stakeParam, roomParam]);

  // Rematch action
  const handleRematch = useCallback(() => {
    try {
      battleService.deductEntryFee(stakeParam);
    } catch { }
    const myId = user?._id || user?.id || profile?._id || sessionUserProfile?.userId;
    const newRoom = "LUDO-" + Math.floor(1000 + Math.random() * 9000);
    const matched = battleService.getMultipleOpponents(Math.max(1, playersParam - 1), myId);
    setOpponents(matched);
    setGameState("playing");
    setGameResult(null);
    router.replace(
      `/user/battle/game?room=${newRoom}&stake=${stakeParam}&players=${playersParam}&prize=${prizeParam}`
    );
  }, [stakeParam, playersParam, prizeParam, router]);

  const handleExitToLobby = useCallback(() => {
    try {
      const myId = user?._id || user?.userId || profile?._id || profile?.userId;
      if (roomParam && myId) {
        battleService.leaveBattleRoomViaSocket({ roomId: roomParam, userId: myId });
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pj_active_battle");
      }
    } catch (e) {}
    router.push("/user/battle");
  }, [user, profile, roomParam, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0214] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-zinc-400">Loading King Star Ludo Arena...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0214] text-white flex flex-col justify-between select-none overflow-x-hidden">
      {/* 1. MAIN LUDO BOARD ARENA */}
      {gameState === "playing" && (
        <LudoBoard
          stake={stakeParam}
          prize={prizeParam}
          opponents={opponents}
          opponent={opponents[0]}
          playerCount={playersParam}
          roomCode={roomParam}
          userProfile={profile || user || sessionUserProfile}
          isHost={isHost}
          onGameOver={handleGameOver}
          onExit={handleExitToLobby}
        />
      )}

      {/* 2. GAME OVER MODAL */}
      {gameState === "game_over" && gameResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" />
          <div className="relative w-full max-w-sm bg-[#140628] text-white rounded-3xl border-2 border-purple-500/50 shadow-2xl p-6 text-center z-10 animate-in zoom-in-95">
            {gameResult.result === "WON" ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/50 animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                    VICTORY!
                  </span>
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
                    You Won ₹{gameResult.prize}!
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 font-normal">
                    Cash prize has been instantly credited to your Prem Jodo wallet.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRematch}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 font-medium text-xs shadow-lg shadow-rose-500/30 hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rematch</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExitToLobby}
                    className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-medium text-xs hover:bg-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Lobby</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/40">
                  <Swords className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                    MATCH OVER
                  </span>
                  <h2 className="text-xl font-semibold text-white">Better Luck Next Time!</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-normal">
                    Another player won this round. Ready to take revenge?
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRematch}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 font-bold text-xs shadow-lg shadow-rose-500/30 hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Play Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExitToLobby}
                    className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Lobby</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BattleGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0214] flex items-center justify-center text-white">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <GameArenaContent />
    </Suspense>
  );
}
