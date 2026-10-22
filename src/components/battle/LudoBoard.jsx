"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Crown,
  Sparkles,
  RefreshCw,
  Trophy,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import DiceRoller from "./DiceRoller";
import GameChat from "./GameChat";
import battleService from "@/lib/services/battle.service";
import authService from "@/lib/services/auth.service";

// Standard 52-cell coordinate map on a 15x15 grid (row, col from 0 to 14)
// Clockwise starting from Blue's start (row 13, col 6 - step 0):
const TRACK_COORDINATES = [
  // 1. Blue Start & Left-side track going up (steps 0 to 11)
  { r: 13, c: 6 }, // 0 (Blue Start, Step 0)
  { r: 12, c: 6 }, // 1
  { r: 11, c: 6 }, // 2
  { r: 10, c: 6 }, // 3
  { r: 9, c: 6 },  // 4
  { r: 8, c: 5 },  // 5
  { r: 8, c: 4 },  // 6
  { r: 8, c: 3 },  // 7
  { r: 8, c: 2 },  // 8 (Safe Star - Red side)
  { r: 8, c: 1 },  // 9
  { r: 8, c: 0 },  // 10
  { r: 7, c: 0 },  // 11
  // 2. Red Start & Top-side track going up then right (steps 12 to 24)
  { r: 6, c: 0 },  // 12
  { r: 6, c: 1 },  // 13 (Red Start)
  { r: 6, c: 2 },  // 14
  { r: 6, c: 3 },  // 15
  { r: 6, c: 4 },  // 16
  { r: 6, c: 5 },  // 17
  { r: 5, c: 6 },  // 18
  { r: 4, c: 6 },  // 19
  { r: 3, c: 6 },  // 20
  { r: 2, c: 6 },  // 21 (Safe Star - Green side)
  { r: 1, c: 6 },  // 22
  { r: 0, c: 6 },  // 23
  { r: 0, c: 7 },  // 24
  // 3. Green Start & Right-side track going down (steps 25 to 37)
  { r: 0, c: 8 },  // 25
  { r: 1, c: 8 },  // 26 (Green Start)
  { r: 2, c: 8 },  // 27
  { r: 3, c: 8 },  // 28
  { r: 4, c: 8 },  // 29
  { r: 5, c: 8 },  // 30
  { r: 6, c: 9 },  // 31
  { r: 6, c: 10 }, // 32
  { r: 6, c: 11 }, // 33
  { r: 6, c: 12 }, // 34 (Safe Star - Yellow side)
  { r: 6, c: 13 }, // 35
  { r: 6, c: 14 }, // 36
  { r: 7, c: 14 }, // 37
  // 4. Yellow Start & Bottom-side track going down then left (steps 38 to 50)
  { r: 8, c: 14 }, // 38
  { r: 8, c: 13 }, // 39 (Yellow Start)
  { r: 8, c: 12 }, // 40
  { r: 8, c: 11 }, // 41
  { r: 8, c: 10 }, // 42
  { r: 8, c: 9 },  // 43
  { r: 9, c: 8 },  // 44
  { r: 10, c: 8 }, // 45
  { r: 11, c: 8 }, // 46
  { r: 12, c: 8 }, // 47 (Safe Star - Blue side)
  { r: 13, c: 8 }, // 48
  { r: 14, c: 8 }, // 49
  { r: 14, c: 7 }, // 50
  { r: 14, c: 6 }, // 51
];

// 4 Base Token Slot Coordinates for each yard
const BLUE_BASE_SLOTS = [
  { r: 10, c: 1 },
  { r: 10, c: 3 },
  { r: 12, c: 1 },
  { r: 12, c: 3 },
];

const RED_BASE_SLOTS = [
  { r: 1, c: 1 },
  { r: 1, c: 3 },
  { r: 3, c: 1 },
  { r: 3, c: 3 },
];

const GREEN_BASE_SLOTS = [
  { r: 1, c: 10 },
  { r: 1, c: 12 },
  { r: 3, c: 10 },
  { r: 3, c: 12 },
];

const YELLOW_BASE_SLOTS = [
  { r: 10, c: 10 },
  { r: 10, c: 12 },
  { r: 12, c: 10 },
  { r: 12, c: 12 },
];

const PLAYER_CONFIGS = [
  {
    id: "blue",
    color: "blue",
    label: "BLUE",
    themeColor: "#00A8FF",
    baseSlots: BLUE_BASE_SLOTS,
    startOffset: 0,
    corridor: [
      { r: 13, c: 7 },
      { r: 12, c: 7 },
      { r: 11, c: 7 },
      { r: 10, c: 7 },
      { r: 9, c: 7 },
      { r: 8, c: 7 },
    ],
  },
  {
    id: "red",
    color: "red",
    label: "RED",
    themeColor: "#EF4444",
    baseSlots: RED_BASE_SLOTS,
    startOffset: 13,
    corridor: [
      { r: 7, c: 1 },
      { r: 7, c: 2 },
      { r: 7, c: 3 },
      { r: 7, c: 4 },
      { r: 7, c: 5 },
      { r: 7, c: 6 },
    ],
  },
  {
    id: "green",
    color: "green",
    label: "GREEN",
    themeColor: "#10B981",
    baseSlots: GREEN_BASE_SLOTS,
    startOffset: 26,
    corridor: [
      { r: 1, c: 7 },
      { r: 2, c: 7 },
      { r: 3, c: 7 },
      { r: 4, c: 7 },
      { r: 5, c: 7 },
      { r: 6, c: 7 },
    ],
  },
  {
    id: "yellow",
    color: "yellow",
    label: "YELLOW",
    themeColor: "#EAB308",
    baseSlots: YELLOW_BASE_SLOTS,
    startOffset: 39,
    corridor: [
      { r: 7, c: 13 },
      { r: 7, c: 12 },
      { r: 7, c: 11 },
      { r: 7, c: 10 },
      { r: 7, c: 9 },
      { r: 7, c: 8 },
    ],
  },
];

// Exact Teardrop/Pin Pawn Token centered perfectly inside 1x1 cell
function LudoPinPawn({ color = "blue", isMovable = false }) {
  const colorMap = {
    blue: {
      fill: "#00A8FF",
      border: "#0077CC",
      padBg: "#1E3A8A",
      padRing: "#38BDF8",
    },
    yellow: {
      fill: "#EAB308",
      border: "#CA8A04",
      padBg: "#713F12",
      padRing: "#FACC15",
    },
    red: {
      fill: "#EF4444",
      border: "#B91C1C",
      padBg: "#7F1D1D",
      padRing: "#F87171",
    },
    green: {
      fill: "#10B981",
      border: "#047857",
      padBg: "#064E3B",
      padRing: "#34D399",
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`w-full h-full flex items-center justify-center select-none ${isMovable ? "scale-110 animate-bounce z-40" : ""
        }`}
    >
      <svg
        viewBox="0 0 36 42"
        className={`w-6 h-7 sm:w-7 sm:h-8 md:w-7.5 md:h-8.5 drop-shadow-md transition-transform ${isMovable
          ? "filter drop-shadow-[0_0_10px_rgba(250,204,21,1)] cursor-pointer scale-110"
          : "filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
          }`}
      >
        <ellipse cx="18" cy="39" rx="10" ry="2.5" fill="rgba(0,0,0,0.3)" />
        <ellipse
          cx="18"
          cy="37"
          rx="9"
          ry="3"
          fill={theme.padBg}
          stroke={theme.padRing}
          strokeWidth="1"
        />
        <path
          d="M 18 38 C 13.5 30, 5 22, 5 14 C 5 6.8, 10.8 1, 18 1 C 25.2 1, 31 6.8, 31 14 C 31 22, 22.5 30, 18 38 Z"
          fill="#FFFFFF"
          stroke="#9CA3AF"
          strokeWidth="1.2"
        />
        <circle
          cx="18"
          cy="14"
          r="8"
          fill={theme.fill}
          stroke={theme.border}
          strokeWidth="0.8"
        />
        <ellipse
          cx="15"
          cy="11"
          rx="2.8"
          ry="1.6"
          fill="#FFFFFF"
          opacity="0.8"
          transform="rotate(-30 15 11)"
        />
      </svg>
    </div>
  );
}

export default function LudoBoard({
  stake = 50,
  prize = 90,
  opponent = null,
  opponents = [],
  playerCount = 2,
  roomCode = null,
  userProfile,
  isHost = true,
  onGameOver,
  onExit,
}) {
  const activeOpponents = opponents && opponents.length > 0
    ? opponents
    : opponent
      ? [opponent]
      : [];

  const effectivePlayerCount = Math.min(4, Math.max(2, playerCount || activeOpponents.length + 1));

  const [syncedPlayers, setSyncedPlayers] = useState([]);

  // 1. Resolve My Details (Checking props, saved profile & localStorage)
  const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;
  const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
  const resolvedProfile = userProfile || storedProfile || storedUser;

  const myUserId = String(
    resolvedProfile?._id ||
    resolvedProfile?.id ||
    resolvedProfile?.userId ||
    userProfile?._id ||
    userProfile?.id ||
    "user_local"
  );
  let myName =
    resolvedProfile?.fullName ||
    resolvedProfile?.name ||
    resolvedProfile?.firstName ||
    userProfile?.fullName ||
    userProfile?.name ||
    userProfile?.username ||
    storedProfile?.fullName ||
    storedUser?.fullName ||
    storedUser?.name;
  const myPhoto =
    resolvedProfile?.photos?.[0]?.url ||
    resolvedProfile?.photos?.[0] ||
    resolvedProfile?.photo ||
    resolvedProfile?.avatar ||
    userProfile?.photos?.[0]?.url ||
    userProfile?.photos?.[0] ||
    userProfile?.photo ||
    userProfile?.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

  // 2. Resolve Opponent Details (Strictly excluding current user)
  const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
  const cleanMyName = String(myName || "").trim().toLowerCase();

  const realOpponents = activeOpponents.filter((opp) => {
    if (!opp) return false;
    const oppId = String(opp.userId || opp.id || opp._id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    const oppN = String(opp.name || opp.fullName || "").trim().toLowerCase();
    if (cleanMyId && oppId && oppId === cleanMyId) return false;
    if (cleanMyName && oppN && oppN === cleanMyName) return false;
    return true;
  });

  const opp1 = realOpponents[0] || {};
  let oppName = opp1.name || opp1.fullName || opp1.username;
  let oppPhoto =
    opp1.avatar ||
    opp1.photos?.[0]?.url ||
    opp1.photos?.[0] ||
    opp1.photo;

  const opp1Id = opp1.userId || opp1.id || opp1._id;

  // Server synced player data
  const sP0 = syncedPlayers[0];
  const sP1 = syncedPlayers[1];

  const sHostName = sP0?.name || sP0?.fullName || sP0?.user?.fullName || sP0?.user?.name;
  const sHostPhoto = sP0?.avatar || sP0?.user?.avatar || sP0?.user?.photos?.[0]?.url;

  const sGuestName = sP1?.name || sP1?.fullName || sP1?.user?.fullName || sP1?.user?.name;
  const sGuestPhoto = sP1?.avatar || sP1?.user?.avatar || sP1?.user?.photos?.[0]?.url;

  if (!oppName || oppName.toLowerCase() === "user" || oppName.toLowerCase() === "player" || oppName.toLowerCase() === "opponent" || oppName.toLowerCase() === cleanMyName) {
    if (sHostName && !isHost && sHostName.toLowerCase() !== cleanMyName) {
      oppName = sHostName;
      if (sHostPhoto) oppPhoto = sHostPhoto;
    } else if (sGuestName && isHost && sGuestName.toLowerCase() !== cleanMyName) {
      oppName = sGuestName;
      if (sGuestPhoto) oppPhoto = sGuestPhoto;
    } else if (opp1Id) {
      const cleanId = String(opp1Id).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const matched = battleService.getOnlineOpponents(cleanMyId).find((p) => {
        const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        return pId && cleanId && pId === cleanId;
      });
      if (matched && (matched.name || matched.fullName)) {
        oppName = matched.name || matched.fullName;
        if (matched.avatar) oppPhoto = matched.avatar;
      }
    }
    if (!oppName || oppName.toLowerCase() === "user" || oppName.toLowerCase() === cleanMyName) {
      const otherOnline = battleService.getOnlineOpponents(cleanMyId)[0];
      if (otherOnline && (otherOnline.name || otherOnline.fullName)) {
        oppName = otherOnline.name || otherOnline.fullName;
        if (otherOnline.avatar) oppPhoto = otherOnline.avatar;
      } else {
        oppName = cleanMyName.includes("sagar") ? "Sonam" : "Sagar";
        oppPhoto = cleanMyName.includes("sagar")
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80";
      }
    }
  }

  if (!myName || myName.toLowerCase() === "user" || myName.toLowerCase() === "player") {
    if (isHost && sHostName) {
      myName = sHostName;
    } else if (!isHost && sGuestName) {
      myName = sGuestName;
    }
  }
  if (!myName) {
    myName = isHost ? (oppName === "Sonam" ? "Sagar" : "Sonam") : (oppName === "Sagar" ? "Sonam" : "Sagar");
  }

  if (!oppPhoto) {
    oppPhoto = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80";
  }

  // When isHost is true: You are Player 0 (Blue), Opponent is Player 1 (Red)
  // When isHost is false: Opponent/Challenger is Player 0 (Blue), You are Player 1 (Red)
  const myPlayerIndex = isHost ? 0 : 1;

  // Build the array of active players (up to 4)
  const players = useMemo(() => {
    const p0Name = (isHost ? myName : (sHostName || oppName));
    const p0Photo = (isHost ? myPhoto : (sHostPhoto || oppPhoto));
    const p1Name = (isHost ? (sGuestName || oppName) : myName);
    const p1Photo = (isHost ? (sGuestPhoto || oppPhoto) : myPhoto);

    return [
      {
        index: 0,
        id: "blue",
        name: p0Name,
        avatar: p0Photo,
        color: "blue",
        isUser: isHost,
        badge: isHost ? "YOU" : "P1",
        userId: isHost ? myUserId : (sP0?.userId || opp1.userId || opp1.id || opp1._id),
      },
      ...(effectivePlayerCount >= 2
        ? [
          {
            index: 1,
            id: "red",
            name: p1Name,
            avatar: p1Photo,
            color: "red",
            isUser: !isHost,
            badge: !isHost ? "YOU" : "P2",
            userId: !isHost ? myUserId : (sP1?.userId || opp1.userId || opp1.id || opp1._id),
          },
        ]
        : []),
      ...(effectivePlayerCount >= 3
        ? [
          {
            index: 2,
            id: "green",
            name: syncedPlayers[2]?.name || activeOpponents[1]?.name || "Arjun",
            avatar:
              syncedPlayers[2]?.avatar ||
              activeOpponents[1]?.avatar ||
              "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
            color: "green",
            isUser: false,
            badge: "P3",
          },
        ]
        : []),
      ...(effectivePlayerCount >= 4
        ? [
          {
            index: 3,
            id: "yellow",
            name: syncedPlayers[3]?.name || activeOpponents[2]?.name || "Vikram",
            avatar:
              syncedPlayers[3]?.avatar ||
              activeOpponents[2]?.avatar ||
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
            color: "yellow",
            isUser: false,
            badge: "P4",
          },
        ]
        : []),
    ];
  }, [
    isHost,
    myName,
    myPhoto,
    myUserId,
    oppName,
    oppPhoto,
    sHostName,
    sHostPhoto,
    sGuestName,
    sGuestPhoto,
    effectivePlayerCount,
    activeOpponents,
    opp1,
    syncedPlayers,
    sP0,
    sP1,
  ]);

  // 4 tokens for each of the 4 players: [-1, -1, -1, -1]
  const [allTokens, setAllTokens] = useState([
    [-1, -1, -1, -1], // Blue (Player 0)
    [-1, -1, -1, -1], // Red (Player 1)
    [-1, -1, -1, -1], // Green (Player 2)
    [-1, -1, -1, -1], // Yellow (Player 3)
  ]);

  const [currentTurn, setCurrentTurn] = useState(0); // 0 = Blue, 1 = Red, 2 = Green, 3 = Yellow
  const [diceValue, setDiceValue] = useState(6);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [turnTimer, setTurnTimer] = useState(15);
  const [statusMessage, setStatusMessage] = useState(
    isHost
      ? "🔵 Your turn (BLUE)! Tap the dice to roll."
      : "⏳ Waiting for Host (BLUE) to roll..."
  );
  const [lastMoveDesc, setLastMoveDesc] = useState("");
  const [activeReactions, setActiveReactions] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const turnTimeoutRef = useRef(null);
  const movePlayerTokenRef = useRef(null);

  const activePlayer = players[currentTurn] || players[0];
  const myPlayer = players[myPlayerIndex] || players[0];
  const isMyTurn = currentTurn === myPlayerIndex;
  const isMultiplayer = Boolean(roomCode);

  // Persistent Low-Latency Audio Engine
  const playSound = (type = "roll") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "roll") {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === "move") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "cut") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch { }
  };

  // Turn timer countdown
  useEffect(() => {
    setTurnTimer(15);
    const interval = setInterval(() => {
      setTurnTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTurn]);

  // Coordinates calculator for any player & token
  const getTokenCoords = (pIdx, tokenIndex, pos) => {
    const config = PLAYER_CONFIGS[pIdx] || PLAYER_CONFIGS[0];
    if (pos === -1) {
      return config.baseSlots[tokenIndex] || config.baseSlots[0];
    }
    if (pos >= 56) {
      return { r: 7, c: 7 }; // Center Goal
    }
    if (pos >= 51) {
      const idx = pos - 51;
      return config.corridor[idx] || { r: 7, c: 7 };
    }
    const globalStep = (pos + config.startOffset) % 52;
    return TRACK_COORDINATES[globalStep] || { r: 7, c: 7 };
  };

  // Valid moves for a player given roll
  const getValidMovesForPlayer = useCallback(
    (pIdx, roll) => {
      const playerTokens = allTokens[pIdx] || [-1, -1, -1, -1];
      const valid = [];
      playerTokens.forEach((pos, idx) => {
        if (pos >= 56) return; // In Goal
        if (pos === -1) {
          if (roll === 6) valid.push(idx);
        } else if (pos + roll <= 56) {
          valid.push(idx);
        }
      });
      return valid;
    },
    [allTokens]
  );

  // Advance turn to next player
  const advanceTurn = useCallback((overrideNextTurn = null) => {
    setHasRolled(false);
    setIsRolling(false);
    isAnimatingRef.current = false;
    const next = overrideNextTurn !== null ? overrideNextTurn : (currentTurn + 1) % effectivePlayerCount;
    setCurrentTurn(next);
  }, [currentTurn, effectivePlayerCount]);

  // Move token animation for any player
  const movePlayerToken = useCallback(
    async (pIdx, tokenIndex, roll) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setHasRolled(false);

      const oldPos = allTokens[pIdx][tokenIndex];
      const player = players[pIdx] || players[0];

      if (oldPos === -1) {
        playSound("move");
        setAllTokens((prev) => {
          const next = prev.map((arr, i) =>
            i === pIdx ? arr.map((pos, tI) => (tI === tokenIndex ? 0 : pos)) : arr
          );
          return next;
        });
        setLastMoveDesc(`🚀 ${player.name} (${player.color.toUpperCase()}) exited Base onto track!`);
        await new Promise((r) => setTimeout(r, 320));
      } else {
        const targetStep = Math.min(56, oldPos + roll);
        for (let step = oldPos + 1; step <= targetStep; step++) {
          playSound("move");
          setAllTokens((prev) => {
            const next = prev.map((arr, i) =>
              i === pIdx ? arr.map((pos, tI) => (tI === tokenIndex ? step : pos)) : arr
            );
            return next;
          });
          await new Promise((resolve) => setTimeout(resolve, 220));
        }
        setLastMoveDesc(`⏩ ${player.name} moved pawn ${roll} steps forward.`);
      }

      const finalPos = oldPos === -1 ? 0 : Math.min(56, oldPos + roll);
      let isCut = false;
      let isGoal = false;

      // Safe star steps (global coordinates on 52-cell track)
      const SAFE_STARS = [0, 8, 13, 21, 26, 34, 39, 47];

      // Check capture/cut on track (0 to 50)
      if (finalPos >= 0 && finalPos <= 50) {
        const playerConfig = PLAYER_CONFIGS[pIdx] || PLAYER_CONFIGS[0];
        const landingGlobal = (finalPos + playerConfig.startOffset) % 52;

        if (!SAFE_STARS.includes(landingGlobal)) {
          // Check other players' tokens
          setAllTokens((prev) => {
            let cutOccurred = false;
            const nextState = prev.map((tokensArr, otherPIdx) => {
              if (otherPIdx === pIdx) return tokensArr;
              const otherConfig = PLAYER_CONFIGS[otherPIdx] || PLAYER_CONFIGS[0];
              return tokensArr.map((pos) => {
                if (pos >= 0 && pos <= 50) {
                  const otherGlobal = (pos + otherConfig.startOffset) % 52;
                  if (otherGlobal === landingGlobal) {
                    cutOccurred = true;
                    return -1; // Send back to yard
                  }
                }
                return pos;
              });
            });

            if (cutOccurred) {
              isCut = true;
              playSound("cut");
              setLastMoveDesc(`⚔️ ${player.name} captured an opponent's pawn! Bonus roll!`);
            }
            return nextState;
          });
        }
      }

      if (finalPos >= 56) {
        playSound("win");
        isGoal = true;
        setLastMoveDesc(`🎯 ${player.name}'s pawn reached the Goal!`);
      }

      isAnimatingRef.current = false;

      // Check Victory condition (all 4 pawns home to finish match)
      const updatedTokens = allTokens[pIdx].map((p, idx) =>
        idx === tokenIndex ? finalPos : p
      );
      const homeCount = updatedTokens.filter((p) => p >= 56).length;
      if (homeCount >= 4) {
        playSound("win");
        const isWinner = pIdx === myPlayerIndex;
        if (onGameOver) {
          onGameOver(isWinner ? "WON" : "LOST", isWinner ? prize : 0, {
            roomId: roomCode,
            roomCode,
            isMultiplayer,
          });
        }
        return;
      }

      // Bonus Roll check (rolled 6 or cut or reached 57)
      if (roll === 6 || isCut || isGoal) {
        const isMe = pIdx === myPlayerIndex;
        setStatusMessage(
          isMe
            ? "🎲 Bonus Roll! You get another turn to roll the dice!"
            : `⚡ ${player.name} gets a Bonus Roll!`
        );
        if (isMe) {
          setHasRolled(false);
        } else if (!isMultiplayer) {
          // AI offline simulation bonus roll
          setTimeout(() => {
            handleOpponentTurn(pIdx);
          }, 800);
        }
      } else {
        // Pass turn to next player
        const nextTurn = (pIdx + 1) % effectivePlayerCount;
        setTimeout(() => {
          advanceTurn(nextTurn);
          if (pIdx === myPlayerIndex && roomCode) {
            try {
              battleService.advanceTurnViaSocket({
                roomId: roomCode,
                currentTurnIndex: nextTurn,
                isExtraTurn: false,
              });
            } catch (e) { }
          }
        }, 600);
      }
    },
    [allTokens, players, prize, onGameOver, advanceTurn, effectivePlayerCount, myPlayerIndex, isMultiplayer, roomCode]
  );

  // Active Turn Timer countdown & auto-timeout handler
  useEffect(() => {
    setTurnTimer(15);
    const interval = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn]);

  // Automated Opponent Turn Engine (ONLY for offline / non-multiplayer AI simulation)
  const handleOpponentTurn = useCallback(
    (pIdx) => {
      if (isAnimatingRef.current || isMultiplayer) return;
      const opp = players[pIdx];
      if (!opp || opp.isUser) return;

      setStatusMessage(`⏳ ${opp.name} (${opp.color.toUpperCase()}) is rolling the dice...`);
      setIsRolling(true);
      playSound("roll");

      setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);
        setIsRolling(false);
        setHasRolled(true);

        const validMoves = getValidMovesForPlayer(pIdx, roll);

        if (validMoves.length === 0) {
          setStatusMessage(`${opp.name} rolled ${roll}! No valid moves.`);
          setTimeout(() => {
            advanceTurn();
          }, 1100);
        } else {
          // AI Decision: prefer opening base token on 6, else advance highest position token
          let chosenToken = validMoves[0];
          const tokens = allTokens[pIdx];
          const baseMove = validMoves.find((tI) => tokens[tI] === -1);
          if (roll === 6 && baseMove !== undefined) {
            chosenToken = baseMove;
          } else {
            chosenToken = validMoves.reduce((best, curr) =>
              tokens[curr] > tokens[best] ? curr : best
            );
          }

          setStatusMessage(`${opp.name} rolled ${roll}! Moving pawn...`);
          setTimeout(() => {
            movePlayerToken(pIdx, chosenToken, roll);
          }, 500);
        }
      }, 700);
    },
    [players, allTokens, getValidMovesForPlayer, movePlayerToken, advanceTurn, isMultiplayer]
  );

  const handleOpponentTurnRef = useRef(null);
  handleOpponentTurnRef.current = handleOpponentTurn;
  movePlayerTokenRef.current = movePlayerToken;

  // Trigger automated turn ONLY when NOT in multiplayer room
  useEffect(() => {
    if (currentTurn !== myPlayerIndex) {
      if (!isMultiplayer) {
        if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
        turnTimeoutRef.current = setTimeout(() => {
          if (handleOpponentTurnRef.current) {
            handleOpponentTurnRef.current(currentTurn);
          }
        }, 600);
      } else {
        const opp = players[currentTurn] || players[1];
        setStatusMessage(`⏳ Waiting for ${opp.name} (${opp.color.toUpperCase()}) to roll...`);
      }
    } else {
      const myColor = myPlayerIndex === 0 ? "BLUE" : "RED";
      setStatusMessage(`🔵 Your Turn (${myColor})! Tap the dice on the right to roll.`);
    }
    return () => {
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    };
  }, [currentTurn, myPlayerIndex, isMultiplayer, players]);

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const myNameRef = useRef(myName);
  myNameRef.current = myName;

  const myPhotoRef = useRef(myPhoto);
  myPhotoRef.current = myPhoto;

  const myPlayerIndexRef = useRef(myPlayerIndex);
  myPlayerIndexRef.current = myPlayerIndex;

  const prizeRef = useRef(prize);
  prizeRef.current = prize;

  const effectivePlayerCountRef = useRef(effectivePlayerCount);
  effectivePlayerCountRef.current = effectivePlayerCount;

  const playersRef = useRef(players);
  playersRef.current = players;

  // Real-time battle socket room synchronization & exit/forfeit listeners
  useEffect(() => {
    if (!roomCode || !myUserId) return;
    const bSock = battleService.getBattleSocket();
    const rSock = battleService.getSocket();

    // Ensure player is joined to the socket room once
    battleService.joinBattleRoomViaSocket({
      roomId: roomCode,
      userId: myUserId,
      userDetails: { name: myNameRef.current, avatar: myPhotoRef.current },
    });
    battleService.syncBattleStateViaSocket({ roomId: roomCode, userId: myUserId });

    // 1. State Synced from backend
    const handleServerStateSynced = (data) => {
      if (!data) return;
      const rm = data.room || data;
      if (rm.players && Array.isArray(rm.players)) {
        setSyncedPlayers(rm.players);
        const newTokens = [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]];
        rm.players.forEach((p, idx) => {
          if (p.pawnPositions && Array.isArray(p.pawnPositions)) {
            newTokens[idx] = p.pawnPositions;
          }
        });
        setAllTokens(newTokens);
      }
      if (typeof rm.currentTurnIndex === "number") {
        setCurrentTurn(rm.currentTurnIndex % effectivePlayerCount);
      }
    };

    // 2. Dice Rolled event from server or opponent
    const handleServerDiceRolled = (data) => {
      if (!data) return;
      const incomingRoom = String(data.roomId || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (incomingRoom && incomingRoom !== currentRoom) return;

      const incomingPlayerIdx = Number(
        data.playerIndex ??
        (String(data.userId) === myUserId ? myPlayerIndex : (myPlayerIndex === 0 ? 1 : 0))
      );
      if (incomingPlayerIdx === myPlayerIndex) return; // Ignore own broadcast

      const incomingDice = Number(data.diceValue || 6);
      setIsRolling(true);
      playSound("roll");

      setTimeout(() => {
        setDiceValue(incomingDice);
        setIsRolling(false);
        setHasRolled(true);
        const rollingPlayer = players[incomingPlayerIdx] || players[1];
        setStatusMessage(`🎲 ${rollingPlayer.name} rolled ${incomingDice}!`);
      }, 350);
    };

    // 3. Pawn Moved event from server or opponent
    const handleServerPawnMoved = (data) => {
      if (!data) return;
      const incomingRoom = String(data.roomId || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (incomingRoom && incomingRoom !== currentRoom) return;

      const incomingPlayerIdx = Number(
        data.playerIndex ??
        data.moveResult?.playerIndex ??
        (String(data.userId) === myUserId ? myPlayerIndex : (myPlayerIndex === 0 ? 1 : 0))
      );
      if (incomingPlayerIdx === myPlayerIndex) return; // Ignore own move

      const pawnIdx = Number(data.pawnIndex ?? data.moveResult?.pawnIndex ?? 0);
      const steps = Number(data.diceValue ?? data.steps ?? data.moveResult?.steps ?? 6);

      if (movePlayerTokenRef.current) {
        movePlayerTokenRef.current(incomingPlayerIdx, pawnIdx, steps);
      }
    };

    // 4. Timer Tick from server (20s)
    const handleServerTimerTick = (data) => {
      if (!data || data.roomId !== roomCode) return;
      if (typeof data.duration === "number") {
        setTurnTimer(data.duration);
      }
    };

    // 5. Turn Missed from server
    const handleServerTurnMissed = (data) => {
      if (!data || data.roomId !== roomCode) return;
      const isMe = String(data.userId) === String(myUserId);
      setStatusMessage(
        isMe
          ? `⚠️ You missed your turn (${data.missedTurns}/${data.maxMissedTurns})`
          : `⚠️ Player missed turn (${data.missedTurns}/${data.maxMissedTurns})`
      );
    };

    // 6. Turn Changed from server or opponent
    const handleServerTurnChanged = (data) => {
      if (!data) return;
      const incomingRoom = String(data.roomId || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (incomingRoom && incomingRoom !== currentRoom) return;

      if (typeof data.currentTurnIndex === "number") {
        setCurrentTurn(data.currentTurnIndex % effectivePlayerCountRef.current);
        setHasRolled(false);
        setIsRolling(false);
        if (data.isExtraTurn) {
          setStatusMessage(`⚡ Extra Bonus Turn!`);
        }
      }
    };

    // 7. Game Over from server
    const handleServerGameOver = (data) => {
      if (!data) return;
      const incomingRoom = String(data.roomId || data.roomCode || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (!incomingRoom || incomingRoom !== currentRoom) return;

      const rawWinnerId = String(data.winner?.userId || data.winnerUserId || data.winner || "").trim();
      const cleanWinnerId = rawWinnerId.replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanProfileUserId = String(
        userProfile?.user?._id || userProfile?.user?.id || userProfile?.user || userProfile?._id || userProfile?.id || ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      const winnerName = String(data.winner?.name || "").trim().toLowerCase();
      const currentUserName = String(myNameRef.current || "").trim().toLowerCase();

      // Check if current user is the winner
      const isWinner = Boolean(
        (cleanWinnerId && cleanMyId && cleanWinnerId === cleanMyId) ||
        (cleanWinnerId && cleanProfileUserId && cleanWinnerId === cleanProfileUserId) ||
        (cleanWinnerId && cleanMyId && (cleanWinnerId.includes(cleanMyId) || cleanMyId.includes(cleanWinnerId))) ||
        (winnerName && currentUserName && (winnerName === currentUserName || currentUserName.includes(winnerName))) ||
        rawWinnerId === "self" ||
        rawWinnerId === "YOU"
      );

      playSound(isWinner ? "win" : "cut");
      if (onGameOverRef.current) {
        onGameOverRef.current(isWinner ? "WON" : "LOST", isWinner ? (data.prizeAmount || prizeRef.current) : 0, {
          roomId: roomCode || data.roomId,
          roomCode: roomCode || data.roomCode,
          isMultiplayer: true,
          reason: data.reason || (isWinner ? "win" : "loss"),
        });
      }
    };

    // 8. Opponent Explicit Forfeited Handler (Triggered when opponent clicks Exit / Forfeit)
    const handlePlayerLeftOrForfeited = (data) => {
      if (!data) return;
      const incomingRoom = String(data.roomId || data.roomCode || "").trim().toUpperCase();
      const currentRoom = String(roomCode || "").trim().toUpperCase();
      if (!incomingRoom || incomingRoom !== currentRoom) return;

      const leftUserId = String(
        data.userId || data.id || data.senderId || data.player?.userId || data.leftPlayerId || ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanProfileUserId = String(
        userProfile?.user?._id || userProfile?.user?.id || userProfile?.user || userProfile?._id || userProfile?.id || ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      // If the leaving player is NOT me, I am strictly the WINNER!
      if (leftUserId && (leftUserId !== cleanMyId && leftUserId !== cleanProfileUserId)) {
        const leavingName = data.name || data.userName || playersRef.current.find((p) => !p.isUser)?.name || "Opponent";
        setStatusMessage(`🏆 ${leavingName} has left/forfeited the match! You won ₹${prizeRef.current}!`);
        playSound("win");
        if (onGameOverRef.current) {
          onGameOverRef.current("WON", prizeRef.current, {
            roomId: roomCode,
            roomCode,
            isMultiplayer: true,
            reason: "opponent_forfeited",
          });
        }
      }
    };

    // 9. Emoji / Chat Received
    const handleServerEmoji = (data) => {
      const reaction = { id: Date.now(), sender: data.name || "Opponent", text: data.emoji };
      setActiveReactions((prev) => [...prev.slice(-3), reaction]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);
    };

    const handleServerChat = (data) => {
      const reaction = { id: Date.now(), sender: data.name || "Opponent", text: data.message };
      setActiveReactions((prev) => [...prev.slice(-3), reaction]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3500);
    };

    // 10. Live Wallet balance updated
    const handleWalletUpdated = (data) => {
      try {
        if (data) {
          battleService.handleSocketWalletUpdated(data);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("battle:wallet_updated", { detail: data }));
          }
        }
      } catch (e) {}
    };

    const eventPairs = [
      { ev: "battle:state_synced", fn: handleServerStateSynced },
      { ev: "battle:dice_rolled", fn: handleServerDiceRolled },
      { ev: "battle:roll_dice", fn: handleServerDiceRolled },
      { ev: "battle:pawn_moved", fn: handleServerPawnMoved },
      { ev: "battle:move_pawn", fn: handleServerPawnMoved },
      { ev: "battle:timer_tick", fn: handleServerTimerTick },
      { ev: "battle:turn_missed", fn: handleServerTurnMissed },
      { ev: "battle:turn_changed", fn: handleServerTurnChanged },
      { ev: "battle:game_over", fn: handleServerGameOver },
      { ev: "battle:game_ended", fn: handleServerGameOver },
      { ev: "battle:forfeit", fn: handlePlayerLeftOrForfeited },
      { ev: "battle:player_forfeited", fn: handlePlayerLeftOrForfeited },
      { ev: "battle:player_left", fn: handlePlayerLeftOrForfeited },
      { ev: "player_left", fn: handlePlayerLeftOrForfeited },
      { ev: "battle:wallet_updated", fn: handleWalletUpdated },
      { ev: "wallet_updated", fn: handleWalletUpdated },
      { ev: "battle:emoji_received", fn: handleServerEmoji },
      { ev: "battle:chat_received", fn: handleServerChat },
    ];

    if (bSock) {
      eventPairs.forEach(({ ev, fn }) => bSock.on(ev, fn));
    }
    if (rSock && rSock !== bSock) {
      eventPairs.forEach(({ ev, fn }) => rSock.on(ev, fn));
    }

    return () => {
      if (bSock) {
        eventPairs.forEach(({ ev, fn }) => bSock.off(ev, fn));
      }
      if (rSock && rSock !== bSock) {
        eventPairs.forEach(({ ev, fn }) => rSock.off(ev, fn));
      }
    };
  }, [roomCode, myUserId]);

  const historyPushedRef = useRef(false);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  // Handle Chrome Previous / Back navigation & beforeunload exit
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!historyPushedRef.current) {
      historyPushedRef.current = true;
      try {
        window.history.pushState({ inGame: true }, "", window.location.href);
      } catch (e) {}
    }

    const handlePopState = () => {
      try {
        if (roomCode) {
          battleService.leaveBattleRoomViaSocket({
            roomId: roomCode,
            userId: myUserId,
          });
        }
        sessionStorage.removeItem("pj_active_battle");
      } catch (e) {}
      if (onExitRef.current) {
        onExitRef.current();
      }
    };

    const handleBeforeUnload = () => {
      if (roomCode) {
        battleService.leaveBattleRoomViaSocket({
          roomId: roomCode,
          userId: myUserId,
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomCode, myUserId]);

  // User Dice Roll Handler
  const handleUserRollDice = () => {
    if (!isMyTurn || hasRolled || isRolling || isAnimatingRef.current) return;

    setIsRolling(true);
    playSound("roll");

    const roll = Math.floor(Math.random() * 6) + 1;

    // Emit live backend socket roll to opponent
    try {
      if (roomCode) {
        battleService.rollBattleDiceViaSocket({
          roomId: roomCode,
          userId: myUserId,
          playerIndex: myPlayerIndex,
          diceValue: roll,
        });
      }
    } catch (e) {
      console.warn("Socket roll dice notice:", e);
    }

    setTimeout(() => {
      setDiceValue(roll);
      setIsRolling(false);
      setHasRolled(true);

      const validMoves = getValidMovesForPlayer(myPlayerIndex, roll);
      if (validMoves.length === 0) {
        setStatusMessage(`Rolled ${roll}! No valid moves.`);
        setTimeout(() => {
          const nextTurn = (myPlayerIndex + 1) % effectivePlayerCount;
          advanceTurn(nextTurn);
          if (roomCode) {
            try {
              battleService.advanceTurnViaSocket({
                roomId: roomCode,
                currentTurnIndex: nextTurn,
                isExtraTurn: false,
              });
            } catch (e) { }
          }
        }, 1100);
      } else if (validMoves.length === 1) {
        setStatusMessage(`Rolled ${roll}! Auto-moving your pawn...`);
        setTimeout(() => {
          movePlayerToken(myPlayerIndex, validMoves[0], roll);
          try {
            if (roomCode) {
              battleService.moveBattlePawnViaSocket({
                roomId: roomCode,
                userId: myUserId,
                playerIndex: myPlayerIndex,
                pawnIndex: validMoves[0],
                diceValue: roll,
              });
            }
          } catch (e) { }
        }, 450);
      } else {
        const myColor = myPlayerIndex === 0 ? "BLUE" : "RED";
        setStatusMessage(`Rolled ${roll}! Tap any highlighted ${myColor} pawn to move.`);
      }
    }, 450);
  };

  const handleResetBoard = () => {
    setAllTokens([
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    setHasRolled(false);
    setCurrentTurn(0);
    setDiceValue(6);
    setStatusMessage("Board reset! Your turn to roll.");
    setLastMoveDesc("");
  };

  const handleSendReaction = (text) => {
    const reaction = { id: Date.now(), sender: "You", text };
    setActiveReactions((prev) => [...prev.slice(-3), reaction]);
    try {
      if (["❤️", "🔥", "😎", "😂", "😢", "🎉", "😱", "🤞"].includes(text)) {
        battleService.sendBattleEmojiViaSocket({
          roomId: roomCode,
          userId: myUserId,
          emoji: text,
          name: myName,
        });
      } else {
        battleService.sendBattleChatViaSocket({
          roomId: roomCode,
          userId: myUserId,
          message: text,
          name: myName,
        });
      }
    } catch (e) { }
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3000);
  };

  const myValidMoves = isMyTurn && hasRolled ? getValidMovesForPlayer(myPlayerIndex, diceValue) : [];
  const myHomeCount = (allTokens[myPlayerIndex] || []).filter((p) => p >= 56).length;

  const handleUserPawnClick = (idx) => {
    if (!isMyTurn || !hasRolled || !myValidMoves.includes(idx)) return;
    movePlayerToken(myPlayerIndex, idx, diceValue);
    try {
      if (roomCode) {
        battleService.moveBattlePawnViaSocket({
          roomId: roomCode,
          userId: myUserId,
          playerIndex: myPlayerIndex,
          pawnIndex: idx,
          diceValue,
        });
      }
    } catch (e) {
      console.warn("Socket move pawn notice:", e);
    }
  };

  const handleExitClick = () => {
    try {
      if (roomCode) {
        battleService.forfeitBattleViaSocket({ roomId: roomCode, userId: myUserId });
        battleService.leaveBattleRoomViaSocket({ roomId: roomCode, userId: myUserId });
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pj_active_battle");
      }
    } catch (e) { }
    if (onExit) onExit();
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-[#0A0214] text-white flex flex-col justify-between select-none overflow-x-hidden">
      {/* ========================================================== */}
      {/* 1. TOP DEDICATED MULTIPLAYER HEADER                        */}
      {/* ========================================================== */}
      <header className="w-full px-4 sm:px-6 py-3 bg-[#140628]/95 backdrop-blur-md border-b border-purple-900/50 flex items-center justify-between z-30">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitClick}
            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-zinc-300 hover:text-white border border-purple-800/60 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby / Exit</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center font-black shadow-md">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                <span>KING STAR LUDO</span>
                {roomCode && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {roomCode}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-amber-400 font-semibold">
                {effectivePlayerCount}-Player Live Battle • Cash Arena
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Players Strip & Turn Glow */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-xl">
            {players.map((p) => {
              const isCurrent = p.index === currentTurn;
              const colorRings = {
                blue: "border-blue-400 ring-2 ring-blue-500",
                red: "border-rose-400 ring-2 ring-rose-500",
                green: "border-emerald-400 ring-2 ring-emerald-500",
                yellow: "border-amber-400 ring-2 ring-yellow-500",
              };
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${isCurrent ? "bg-white/10 scale-105" : "opacity-70"
                    }`}
                  title={`${p.name} (${p.color.toUpperCase()})`}
                >
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className={`w-6 h-6 rounded-full object-cover border ${isCurrent ? colorRings[p.color] : "border-zinc-600"
                        }`}
                    />
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-200 hidden md:inline truncate max-w-[60px]">
                    {p.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Prize Pool */}
          <div className="px-3.5 py-1 rounded-xl bg-black/60 border border-yellow-500/50 text-center shadow-inner">
            <div className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider">
              PRIZE POOL
            </div>
            <div className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-white">
              ₹{prize}
            </div>
          </div>
        </div>

        {/* Right: Sound & Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-yellow-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleResetBoard}
            className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================== */}
      {/* 2. MAIN BATTLE ARENA (BOARD ON LEFT CORNER, MULTIPLAYER DOCK RIGHT)*/}
      {/* ========================================================== */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-5 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-8 xl:gap-12 overflow-x-hidden">
        {/* ======================================================= */}
        {/* LEFT / CORNER: AUTHENTIC 15x15 LUDO BOARD               */}
        {/* ======================================================= */}
        <div className="w-full lg:w-auto flex-1 flex items-center justify-center lg:justify-start">
          <div className="relative p-2.5 sm:p-3.5 md:p-4 rounded-3xl bg-gradient-to-b from-[#2E0854] via-[#1A0430] to-[#0D0219] border-4 border-[#7E22CE] shadow-[0_0_60px_rgba(126,34,206,0.35)] flex items-center justify-center">
            <div
              className="relative w-[340px] sm:w-[480px] md:w-[560px] lg:w-[580px] xl:w-[650px] 2xl:w-[700px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-140px)] aspect-square rounded-2xl bg-white shadow-2xl overflow-hidden select-none"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                gridTemplateRows: "repeat(15, minmax(0, 1fr))",
                border: "3px solid #18181B",
              }}
            >
              {/* 1. TOP-LEFT: RED YARD (PLAYER 1) */}
              <div
                style={{ gridColumn: "1 / 7", gridRow: "1 / 7" }}
                className="bg-[#E52521] p-3 sm:p-3.5 flex items-center justify-center border-r-2 border-b-2 border-zinc-800 relative"
              >
                {effectivePlayerCount >= 2 && (
                  <div className="absolute top-1.5 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-rose-300 flex items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{players[1]?.name.split(" ")[0]}</span>
                    {players[1]?.isUser && (
                      <span className="text-[8px] bg-rose-500 text-white px-1 rounded font-black ml-0.5">
                        YOU
                      </span>
                    )}
                  </div>
                )}
                <div className="w-full h-full rounded-2xl bg-white p-2 flex items-center justify-center shadow-inner">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {allTokens[1].map((pos, idx) => {
                      const isMovable = isMyTurn && myPlayerIndex === 1 && myValidMoves.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isMovable}
                          onClick={() => handleUserPawnClick(idx)}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-transform cursor-pointer"
                        >
                          {pos === -1 ? (
                            <LudoPinPawn color="red" isMovable={isMovable} />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-400/50 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. TOP-MIDDLE ARM: (7..9 cols, 1..6 rows) */}
              <div
                style={{
                  gridColumn: "7 / 10",
                  gridRow: "1 / 7",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(6, minmax(0, 1fr))",
                }}
                className="border-b-2 border-zinc-800"
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = Math.floor(i / 3);
                  const c = (i % 3) + 6;
                  const isGreenCorridor = c === 7 && r > 0;
                  const isGreenArrow = r === 0 && c === 7;
                  const isGreenStart = r === 1 && c === 8;
                  const isSafeStar = r === 2 && c === 6;

                  return (
                    <div
                      key={i}
                      className={`border border-zinc-300 flex items-center justify-center relative ${isGreenCorridor || isGreenStart ? "bg-[#00A859]" : "bg-white"
                        }`}
                    >
                      {isGreenArrow && (
                        <span className="text-[#00A859] font-black text-sm leading-none">↓</span>
                      )}
                      {isSafeStar && (
                        <span className="text-zinc-600 text-base leading-none select-none">☆</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 3. TOP-RIGHT: GREEN YARD (PLAYER 2) */}
              <div
                style={{ gridColumn: "10 / 16", gridRow: "1 / 7" }}
                className="bg-[#00A859] p-3 sm:p-3.5 flex items-center justify-center border-l-2 border-b-2 border-zinc-800 relative"
              >
                {effectivePlayerCount >= 3 && (
                  <div className="absolute top-1.5 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-300 flex items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{players[2]?.name.split(" ")[0]}</span>
                  </div>
                )}
                <div className="w-full h-full rounded-2xl bg-white p-2 flex items-center justify-center shadow-inner">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {allTokens[2].map((pos, idx) => (
                      <div key={idx} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                        {pos === -1 ? (
                          <LudoPinPawn color="green" isMovable={false} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-400/50 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. MIDDLE-LEFT ARM: (1..6 cols, 7..9 rows) */}
              <div
                style={{
                  gridColumn: "1 / 7",
                  gridRow: "7 / 10",
                  display: "grid",
                  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(3, minmax(0, 1fr))",
                }}
                className="border-r-2 border-zinc-800"
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = Math.floor(i / 6) + 6;
                  const c = i % 6;
                  const isRedCorridor = r === 7 && c > 0;
                  const isRedStart = r === 6 && c === 1;
                  const isRedArrow = r === 7 && c === 0;
                  const isSafeStar = r === 8 && c === 2;

                  return (
                    <div
                      key={i}
                      className={`border border-zinc-300 flex items-center justify-center relative ${isRedCorridor || isRedStart ? "bg-[#E52521]" : "bg-white"
                        }`}
                    >
                      {isRedArrow && (
                        <span className="text-[#E52521] font-black text-sm leading-none">→</span>
                      )}
                      {isSafeStar && (
                        <span className="text-zinc-600 text-base leading-none select-none">☆</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 5. CENTER GOAL: 4 CONVERGING COLORED TRIANGLES */}
              <div
                style={{ gridColumn: "7 / 10", gridRow: "7 / 10" }}
                className="relative bg-white border border-zinc-800 overflow-hidden"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="0,0 50,50 0,100" fill="#E52521" />
                  <polygon points="0,0 50,50 100,0" fill="#00A859" />
                  <polygon points="100,0 50,50 100,100" fill="#EAB308" />
                  <polygon points="0,100 50,50 100,100" fill="#00A8FF" />
                </svg>
              </div>

              {/* 6. MIDDLE-RIGHT ARM: (10..15 cols, 7..9 rows) */}
              <div
                style={{
                  gridColumn: "10 / 16",
                  gridRow: "7 / 10",
                  display: "grid",
                  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(3, minmax(0, 1fr))",
                }}
                className="border-l-2 border-zinc-800"
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = Math.floor(i / 6) + 6;
                  const c = (i % 6) + 9;
                  const isYellowCorridor = r === 7 && c < 14;
                  const isYellowStart = r === 8 && c === 13;
                  const isYellowArrow = r === 7 && c === 14;
                  const isSafeStar = r === 6 && c === 12;

                  return (
                    <div
                      key={i}
                      className={`border border-zinc-300 flex items-center justify-center relative ${isYellowCorridor || isYellowStart ? "bg-[#EAB308]" : "bg-white"
                        }`}
                    >
                      {isYellowArrow && (
                        <span className="text-[#EAB308] font-black text-sm leading-none">←</span>
                      )}
                      {isSafeStar && (
                        <span className="text-zinc-600 text-base leading-none select-none">☆</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 7. BOTTOM-LEFT: BLUE YARD (PLAYER 0 / YOU) */}
              <div
                style={{ gridColumn: "1 / 7", gridRow: "10 / 16" }}
                className="bg-[#00A8FF] p-3 sm:p-3.5 flex items-center justify-center border-r-2 border-t-2 border-zinc-800 relative"
              >
                <div className="absolute bottom-1.5 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-blue-300 flex items-center gap-1 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{players[0]?.name.split(" ")[0]}</span>
                  {players[0]?.isUser && (
                    <span className="text-[8px] bg-blue-500 text-white px-1 rounded font-black ml-0.5">
                      YOU
                    </span>
                  )}
                </div>
                <div className="w-full h-full rounded-2xl bg-white p-2 flex items-center justify-center shadow-inner">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {allTokens[0].map((pos, idx) => {
                      const isMovable = isMyTurn && myPlayerIndex === 0 && myValidMoves.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isMovable}
                          onClick={() => handleUserPawnClick(idx)}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-transform cursor-pointer"
                        >
                          {pos === -1 ? (
                            <LudoPinPawn color="blue" isMovable={isMovable} />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-400/50 shadow-inner flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 8. BOTTOM-MIDDLE ARM: (7..9 cols, 10..15 rows) */}
              <div
                style={{
                  gridColumn: "7 / 10",
                  gridRow: "10 / 16",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(6, minmax(0, 1fr))",
                }}
                className="border-t-2 border-zinc-800"
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const r = Math.floor(i / 3) + 9;
                  const c = (i % 3) + 6;
                  const isBlueCorridor = c === 7 && r < 14;
                  const isBlueArrow = r === 14 && c === 7;
                  const isBlueStart = r === 13 && c === 6;
                  const isSafeStar = r === 12 && c === 8;

                  return (
                    <div
                      key={i}
                      className={`border border-zinc-300 flex items-center justify-center relative ${isBlueCorridor || isBlueStart ? "bg-[#00A8FF]" : "bg-white"
                        }`}
                    >
                      {isBlueArrow && (
                        <span className="text-[#00A8FF] font-black text-sm leading-none">↑</span>
                      )}
                      {isSafeStar && (
                        <span className="text-zinc-600 text-base leading-none select-none">☆</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 9. BOTTOM-RIGHT: YELLOW YARD (PLAYER 3) */}
              <div
                style={{ gridColumn: "10 / 16", gridRow: "10 / 16" }}
                className="bg-[#C59B27] p-3 sm:p-3.5 flex items-center justify-center border-l-2 border-t-2 border-zinc-800 relative"
              >
                {effectivePlayerCount >= 4 && (
                  <div className="absolute bottom-1.5 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-yellow-300 flex items-center gap-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>{players[3]?.name.split(" ")[0]}</span>
                  </div>
                )}
                <div className="w-full h-full rounded-2xl bg-white p-2 flex items-center justify-center shadow-inner">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {allTokens[3].map((pos, idx) => (
                      <div key={idx} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                        {pos === -1 ? (
                          <LudoPinPawn color="yellow" isMovable={false} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-yellow-100 border-2 border-yellow-400/50 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* ON-BOARD ACTIVE PAWNS OVERLAY (FOR ALL 4 PLAYERS)       */}
              {/* ======================================================= */}
              {/* Active pawns overlay */}
              {players.map((p) => {
                const pIdx = p.index;
                const pTokens = allTokens[pIdx] || [-1, -1, -1, -1];
                return pTokens.map((pos, idx) => {
                  if (pos === -1) return null; // Inside Base
                  const coords = getTokenCoords(pIdx, idx, pos);
                  const isMovable = isMyTurn && pIdx === myPlayerIndex && myValidMoves.includes(idx);

                  return (
                    <button
                      key={`pawn-${p.id}-${idx}`}
                      type="button"
                      disabled={!isMovable}
                      onClick={() => handleUserPawnClick(idx)}
                      style={{
                        gridColumnStart: coords.c + 1,
                        gridRowStart: coords.r + 1,
                      }}
                      className={`w-full h-full flex items-center justify-center z-30 transition-all duration-300 ${isMovable ? "cursor-pointer scale-110" : ""
                        }`}
                    >
                      <LudoPinPawn color={p.color} isMovable={isMovable} />
                    </button>
                  );
                });
              })}
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT: DEDICATED MULTIPLAYER TURN DOCK & DICE ROLLER    */}
        {/* ======================================================= */}
        <div className="w-full lg:w-[380px] xl:w-[430px] 2xl:w-[460px] flex-shrink-0 flex flex-col items-center space-y-3.5">
          {/* Active Turn Header Card */}
          <div className="w-full p-4 rounded-3xl bg-[#17082E] border-2 border-purple-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={activePlayer.avatar}
                    alt={activePlayer.name}
                    className={`w-11 h-11 rounded-2xl object-cover border-2 ${activePlayer.color === "blue"
                      ? "border-blue-400"
                      : activePlayer.color === "red"
                        ? "border-rose-400"
                        : activePlayer.color === "green"
                          ? "border-emerald-400"
                          : "border-amber-400"
                      }`}
                  />
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-black text-[8px] font-black uppercase text-white border border-white/20">
                    {activePlayer.color}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate max-w-[130px]">
                      {activePlayer.name}
                    </span>
                    {activePlayer.isUser && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded text-white font-black ${activePlayer.color === "blue" ? "bg-blue-500" : "bg-rose-500"
                        }`}>
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Turn Timer: <strong className="text-white">{turnTimer}s</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase">Stake</span>
                <span className="text-sm font-black text-yellow-400">₹{stake}</span>
              </div>
            </div>

            {/* Scoreboard of all 4 players */}
            <div className={`grid gap-1.5 pt-2 border-t border-purple-900/60 ${effectivePlayerCount === 2
              ? "grid-cols-2"
              : effectivePlayerCount === 3
                ? "grid-cols-3"
                : "grid-cols-4"
              }`}>
              {players.map((p) => {
                const home = allTokens[p.index].filter((pos) => pos >= 56).length;
                const isTurn = p.index === currentTurn;
                return (
                  <div
                    key={p.id}
                    className={`p-1.5 rounded-xl text-center border transition-all ${isTurn
                      ? "bg-purple-900/60 border-yellow-400/80 shadow-sm"
                      : "bg-black/30 border-purple-950 text-zinc-400"
                      }`}
                  >
                    <span className="text-[9px] font-bold block truncate">{p.name.split(" ")[0]}</span>
                    <span className="text-[10px] font-extrabold text-emerald-400">{home}/4 🏠</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidance Status Card */}
          <div className="w-full p-3 rounded-2xl bg-[#140628] border border-purple-800/60 text-center shadow-md">
            <div className="text-xs font-bold text-yellow-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-spin" />
              <span>{statusMessage}</span>
            </div>
            {lastMoveDesc && (
              <p className="text-[11px] text-zinc-300 font-medium mt-1">
                {lastMoveDesc}
              </p>
            )}
          </div>

          {/* Big 3D Dice Roller Box */}
          <div className="w-full p-5 rounded-3xl bg-gradient-to-b from-[#220B3B] to-[#120421] border-2 border-yellow-500/60 shadow-2xl flex flex-col items-center">
            <div className="text-xs font-black text-yellow-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>
                {isMyTurn
                  ? `YOUR TURN (${(myPlayer?.color || "blue").toUpperCase()})`
                  : `${activePlayer.name.toUpperCase()}'S TURN (${activePlayer.color.toUpperCase()})`}
              </span>
            </div>

            <DiceRoller
              value={diceValue}
              isRolling={isRolling}
              canRoll={isMyTurn && !hasRolled}
              onRoll={handleUserRollDice}
              playerColor={activePlayer.color}
              playerName={activePlayer.name}
              isMyTurn={isMyTurn}
              turnTimer={turnTimer}
            />
          </div>

          {/* Quick Taunts / Emojis & Chat */}
          <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#140628] border border-purple-800/60 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span>Goal: <strong className="text-emerald-400">{myHomeCount}/4 Home</strong></span>
            </div>

            <GameChat
              onSendMessage={handleSendReaction}
              activeReactions={activeReactions}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-2 text-center text-[10px] text-zinc-500">
        Prem Jodo Ludo Battle Arena • Fairplay Certified RNG Multiplayer
      </footer>
    </div>
  );
}
