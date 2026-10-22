"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Swords, ShieldCheck, Sparkles, X, Users, Check, Crown, AlertCircle } from "lucide-react";
import battleService from "@/lib/services/battle.service";
import { getBattleSocket, getSocket } from "@/lib/services/socket.service";

const PLAYER_COLORS = [
  { name: "Blue", bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500", glow: "shadow-blue-500/30" },
  { name: "Green", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500", glow: "shadow-emerald-500/30" },
  { name: "Red", bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500", glow: "shadow-rose-500/30" },
  { name: "Yellow", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500", glow: "shadow-amber-500/30" },
];

export default function MatchmakingModal({
  isOpen,
  stake = 50,
  prize = 90,
  playerCount = 2,
  roomCode = null,
  isHost = true,
  onMatchFound,
  onCancel,
  opponent = null,
  opponents = [],
  userProfile = null,
}) {
  const [phase, setPhase] = useState("searching"); // "searching" | "found"
  const [countdown, setCountdown] = useState(3);
  const [dots, setDots] = useState("");
  const [livePlayers, setLivePlayers] = useState([]);
  const [resolvedRoomCode, setResolvedRoomCode] = useState(roomCode);
  const [modalError, setModalError] = useState(null);

  const onMatchFoundRef = useRef(onMatchFound);
  onMatchFoundRef.current = onMatchFound;
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const myUserId = useMemo(() => {
    return String(userProfile?._id || userProfile?.id || userProfile?.userId || "user_local");
  }, [userProfile?._id, userProfile?.id, userProfile?.userId]);

  const myName = userProfile?.fullName || userProfile?.name || "You";
  const myAvatar =
    userProfile?.photos?.[0]?.url ||
    userProfile?.photos?.[0] ||
    userProfile?.photo ||
    userProfile?.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

  const opponentKey = useMemo(() => {
    if (Array.isArray(opponents) && opponents.length > 0) {
      return opponents.map((o) => o?.userId || o?._id || o?.id || "").join("-");
    }
    return opponent?.userId || opponent?._id || opponent?.id || "";
  }, [opponents, opponent]);

  // Total other opponent slots needed
  const totalOpponentsNeeded = Math.max(1, playerCount - 1);

  useEffect(() => {
    if (!isOpen) {
      setPhase("searching");
      setCountdown(3);
      setLivePlayers([]);
      return;
    }

    // Initial base player is the user
    const initialMe = {
      userId: myUserId.toString(),
      name: myName,
      avatar: myAvatar,
      isHost: Boolean(isHost),
      isReady: true,
    };

    let initialList = [initialMe];

    // If guest joining an existing room with pre-filled opponents
    if (!isHost) {
      if (opponents && opponents.length > 0) {
        opponents.forEach((opp) => {
          if (opp && opp.userId?.toString() !== myUserId.toString() && !initialList.some(p => p.userId === opp.userId?.toString())) {
            initialList.push({
              userId: opp.userId || opp.id || opp._id,
              name: opp.name || opp.fullName || "Player",
              avatar: opp.avatar || opp.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
              isReady: true,
            });
          }
        });
      } else if (opponent && opponent.userId?.toString() !== myUserId.toString()) {
        initialList.push({
          userId: opponent.userId || opponent.id || opponent._id,
          name: opponent.name || opponent.fullName || "Player",
          avatar: opponent.avatar || opponent.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
          isReady: true,
        });
      }
    }

    setLivePlayers(initialList);

    // Only set phase to found if guest already has all required players
    if (!isHost && initialList.length >= playerCount) {
      setPhase("found");
    }

    // Connect to live sockets
    const bSock = getBattleSocket();
    const rSock = getSocket();

    // Helper to add player objects safely
    const addCandidatePlayers = (candidates) => {
      if (!candidates || !Array.isArray(candidates)) return;
      const cleanMyIdStr = String(myUserId || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanMyNameStr = String(myName || "").trim().toLowerCase();
      const myFirstName = cleanMyNameStr.split(" ")[0];

      setLivePlayers((prev) => {
        const updated = [...prev];
        candidates.forEach((p) => {
          if (!p) return;
          const pId = String(p.userId || p._id || p.id || p.hostUserId || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
          const pName = String(p.name || p.fullName || p.hostName || "").trim().toLowerCase();
          const pFirstName = pName.split(" ")[0];

          // Strictly skip current user
          if (cleanMyIdStr && pId && pId === cleanMyIdStr) return;
          if (cleanMyNameStr && pName && (pName === cleanMyNameStr || (myFirstName.length > 2 && pFirstName === myFirstName))) return;

          if (!updated.some((u) => {
            const uId = String(u.userId || u._id || u.id || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
            const uName = String(u.name || u.fullName || "").trim().toLowerCase();
            return (pId && uId && pId === uId) || (pName && uName && pName === uName);
          })) {
            updated.push({
              userId: p.userId || p._id || p.id || p.hostUserId || pId,
              name: p.name || p.fullName || p.hostName || "Player",
              avatar:
                p.avatar ||
                p.hostAvatar ||
                p.photos?.[0]?.url ||
                p.photos?.[0] ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
              isReady: true,
            });
          }
        });

        const remoteOpponents = updated.filter((u) => {
          const uId = String(u.userId || u._id || u.id || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
          const uName = String(u.name || u.fullName || "").trim().toLowerCase();
          if (cleanMyIdStr && uId && uId === cleanMyIdStr) return false;
          if (cleanMyNameStr && uName && uName === cleanMyNameStr) return false;
          return true;
        });

        if (updated.length >= playerCount && remoteOpponents.length >= totalOpponentsNeeded) {
          setPhase("found");
        }
        return updated;
      });
    };

    // Handle real-time player joined event (Only when a genuine remote player joins)
    const handleRemotePlayerJoined = (data) => {
      if (!data) return;
      console.log("🎮 [Battle Socket Remote Player Joined]:", data);

      const incomingRoom = String(data.roomId || data.roomCode || data.room?.roomId || data.room?.roomCode || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (roomCode && incomingRoom && incomingRoom !== currentRoom) {
        return;
      }

      const candidates = [];
      if (data.joinedPlayer) candidates.push(data.joinedPlayer);
      if (data.player && String(data.player.userId || data.player._id || data.player.id || "") !== String(myUserId)) candidates.push(data.player);
      if (data.userDetails && String(data.userDetails.userId || data.userDetails._id || data.userDetails.id || "") !== String(myUserId)) candidates.push(data.userDetails);

      // If explicit accept event
      if (data.isAccepted || data.accepted || data.status === "ACCEPTED") {
        if (data.opponent) candidates.push(data.opponent);
        if (data.challenger && String(data.challenger.userId || data.challenger._id || "") !== String(myUserId)) candidates.push(data.challenger);
      }

      if (candidates.length > 0) {
        addCandidatePlayers(candidates);
      }
    };

    // Handle server matchmaking match_found (only for automatch queue mode or server-coordinated start)
    const handleGameStart = (data) => {
      if (!data) return;
      console.log("⚔️ [Battle Socket Match Found / Game Start]:", data);
      const incomingRoom = String(data.roomId || data.roomCode || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (roomCode && incomingRoom && incomingRoom !== currentRoom) {
        return;
      }
      if (incomingRoom) {
        setResolvedRoomCode(incomingRoom);
      }

      const candidates = [];
      if (Array.isArray(data.players) && data.players.length > 0) {
        candidates.push(...data.players);
      }
      if (data.opponent) candidates.push(data.opponent);
      if (data.joinedPlayer) candidates.push(data.joinedPlayer);
      if (data.userDetails) candidates.push(data.userDetails);

      if (candidates.length > 0) {
        addCandidatePlayers(candidates);
      }
    };

    // 1. If in room mode, join socket room
    if (roomCode) {
      setResolvedRoomCode(roomCode);
      try {
        battleService.joinBattleRoomViaSocket(
          {
            userId: myUserId,
            userDetails: { name: myName, avatar: myAvatar },
            roomId: roomCode,
          }
        );
      } catch (e) {
        console.warn("Socket join room notice:", e);
      }
    } else {
      // Automatch queue mode
      try {
        battleService.joinAutoMatchQueue({
          userId: myUserId,
          name: myName,
          avatar: myAvatar,
          stakeAmount: stake,
        });
      } catch (e) {
        console.warn("Socket join automatch notice:", e);
      }
    }

    const handleSocketError = (err) => {
      console.warn("⚠️ [MatchmakingModal Socket Error]:", err);
      const msg = typeof err === "string" ? err : err?.message || err?.error || "Error in battle room";
      setModalError(msg);
    };

    const handleRemoteRoomCancelled = (data) => {
      const cancelledCode = (data?.roomId || data?.roomCode || data?.customCode || (typeof data === "string" ? data : "") || "").toString().trim().toUpperCase();
      const currentRoom = (resolvedRoomCode || roomCode || "").toString().trim().toUpperCase();
      if (currentRoom && cancelledCode && currentRoom === cancelledCode) {
        setModalError("Battle room was cancelled by the host.");
        setTimeout(() => {
          if (onCancelRef.current) onCancelRef.current();
        }, 1200);
      }
    };

    // Comprehensive socket event listeners (Strictly for real remote actions)
    const socketEventHandlers = [
      { event: "battle:player_joined", handler: handleRemotePlayerJoined },
      { event: "player_joined", handler: handleRemotePlayerJoined },
      { event: "battle:opponent_entered_code", handler: handleRemotePlayerJoined },
      { event: "battle:challenge_accepted", handler: handleRemotePlayerJoined },
      { event: "challenge_accepted", handler: handleRemotePlayerJoined },
      { event: "battle:opponent_accepted", handler: handleRemotePlayerJoined },
      { event: "battle:match_found", handler: handleGameStart },
      { event: "match_found", handler: handleGameStart },
      { event: "battle:room_cancelled", handler: handleRemoteRoomCancelled },
      { event: "room_cancelled", handler: handleRemoteRoomCancelled },
      { event: "battle:room_deleted", handler: handleRemoteRoomCancelled },
      { event: "room_deleted", handler: handleRemoteRoomCancelled },
      { event: "battle:error", handler: handleSocketError },
      { event: "error", handler: handleSocketError },
    ];

    const attachSocketListeners = (sock) => {
      if (!sock) return;
      socketEventHandlers.forEach(({ event, handler }) => sock.on(event, handler));
    };

    const detachSocketListeners = (sock) => {
      if (!sock) return;
      socketEventHandlers.forEach(({ event, handler }) => sock.off(event, handler));
    };

    attachSocketListeners(bSock);
    if (rSock && rSock !== bSock) attachSocketListeners(rSock);

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(dotInterval);
      detachSocketListeners(bSock);
      if (rSock && rSock !== bSock) detachSocketListeners(rSock);
    };
  }, [isOpen, playerCount, stake, roomCode, myUserId, myName, myAvatar, isHost, opponentKey]);

  // Countdown when phase is "found" (All players entered)
  useEffect(() => {
    if (phase === "found") {
      const countInterval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(countInterval);
    }
  }, [phase]);

  // Launch game once countdown reaches 0
  useEffect(() => {
    if (phase === "found" && countdown === 0) {
      const cleanMyIdStr = String(myUserId || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
      const otherOpponents = livePlayers.filter((p) => {
        const pId = String(p.userId || p._id || p.id || "").trim().toLowerCase().replace(/^(usr_|conv_|chat_|match_)/, "");
        return pId && pId !== cleanMyIdStr;
      });
      if (otherOpponents.length === 0) {
        setPhase("searching");
        setCountdown(3);
        return;
      }
      const timer = setTimeout(() => {
        if (onMatchFoundRef.current) {
          onMatchFoundRef.current(otherOpponents, resolvedRoomCode || roomCode);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown, livePlayers, myUserId, resolvedRoomCode, roomCode]);

  if (!isOpen) return null;

  // Real opponents joined besides the current user
  const otherJoinedOpponents = livePlayers.filter(
    (p) => p.userId?.toString() !== myUserId?.toString()
  );

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
        {phase === "searching" && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Stake and Prize Pill */}
        <div className="px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs font-bold mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
          <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{playerCount} Player Battle</span>
          <span>•</span>
          <span>Stake: ₹{stake}</span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">Prize: ₹{prize}</span>
          {roomCode && (
            <>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">Code: {roomCode}</span>
            </>
          )}
        </div>

        {/* Modal Error Alert if any */}
        {modalError && (
          <div className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/60 mb-3 text-left flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-300 block">Notice</span>
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug">{modalError}</span>
            </div>
            <button
              onClick={() => setModalError(null)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SEARCHING / WAITING PHASE */}
        {phase === "searching" && (
          <div className="w-full flex flex-col items-center py-2 space-y-5">
            {/* Radar Animation */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping duration-1000" />
              <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30 border-2 border-white/40">
                <Users className="w-9 h-9 text-white animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl poppins-bold text-zinc-900 dark:text-white">
                Waiting for {playerCount} Players ({livePlayers.length}/{playerCount} Joined){dots}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Game will start automatically as soon as all {playerCount} players enter the room!
              </p>
            </div>

            {/* Live Real Player Slots Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
              {/* Slot 1: You */}
              <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-blue-300 dark:border-blue-500/60 flex flex-col items-center shadow-xs">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-400 relative">
                  <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                  <div className="absolute top-0 right-0 bg-blue-500 text-[8px] font-black px-1 rounded-bl text-white">
                    YOU
                  </div>
                </div>
                <span className="text-[11px] font-bold text-zinc-900 dark:text-white mt-1 truncate max-w-[75px]">{myName}</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5 text-blue-500" /> Ready
                </span>
              </div>

              {/* Opponent Slots (Strictly Dynamic) */}
              {Array.from({ length: totalOpponentsNeeded }).map((_, idx) => {
                const joinedOpp = otherJoinedOpponents[idx];
                const isSlotFilled = Boolean(joinedOpp);
                const color = PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length];

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center shadow-xs ${
                      isSlotFilled
                        ? `bg-zinc-50 dark:bg-zinc-900/90 border-zinc-300 dark:${color.border} scale-100`
                        : "bg-zinc-100/60 dark:bg-zinc-950/60 border-dashed border-zinc-300 dark:border-zinc-800 scale-95 opacity-60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                      {isSlotFilled ? (
                        <img
                          src={joinedOpp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                          alt={joinedOpp.name}
                          className="w-full h-full object-cover animate-in zoom-in-50"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-zinc-400 dark:text-zinc-600 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-300 mt-1 truncate max-w-[75px]">
                      {isSlotFilled ? joinedOpp.name.split(" ")[0] : `Player ${idx + 2}`}
                    </span>
                    <span
                      className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                        isSlotFilled ? color.text : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {isSlotFilled ? (
                        <>
                          <Check className="w-2.5 h-2.5" /> Joined
                        </>
                      ) : (
                        "Searching..."
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* ALL PLAYERS FOUND / READY PHASE */}
        {phase === "found" && (
          <div className="w-full flex flex-col items-center py-4 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500 animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl poppins-bold text-zinc-900 dark:text-white">
                All {playerCount} Players Joined!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Match starting in <span className="text-amber-500 dark:text-amber-400 font-bold text-sm">{countdown}s</span>
              </p>
            </div>

            {/* Final Player Avatars */}
            <div className="flex items-center justify-center -space-x-3 py-1">
              {livePlayers.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="w-12 h-12 rounded-full border-2 border-rose-500 overflow-hidden shadow-lg"
                >
                  <img
                    src={p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="w-full max-w-xs bg-zinc-200 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-300 dark:border-zinc-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
