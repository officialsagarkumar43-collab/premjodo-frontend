"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  Wallet,
  Trophy,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame,
  Plus,
  ArrowUpRight,
  HelpCircle,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Crown,
  History,
  Coins,
  ChevronRight,
  KeyRound,
  Loader2,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";
import battleService from "@/lib/services/battle.service";
import { getBattleSocket, getSocket, registerBattleUserOnSocket } from "@/lib/services/socket.service";
import WalletModal from "@/components/battle/WalletModal";
import MatchmakingModal from "@/components/battle/MatchmakingModal";
import ChallengeModal from "@/components/battle/ChallengeModal";
import IncomingChallengeModal from "@/components/battle/IncomingChallengeModal";
import AutoMatchRoomsList from "@/components/battle/AutoMatchRoomsList";
import { useAuth } from "@/context/AuthContext";
import { isBattleReady } from "@/lib/common/featureFlags";

const LIVE_TICKERS = [
  "🔥 Aman won ₹180 in 1v1 Quick Battle 2 mins ago",
  "⚡ Priya won ₹450 against Vikram in Pro Arena",
  "🏆 Pooja is on a 6-match winning streak with ₹2,400 earned!",
  "💎 Sneha withdrew ₹1,200 instantly to UPI",
  "🚀 Over ₹45,000 won by players today in 1v1 Battles!",
];

const DEFAULT_WALLET = {
  balance: 0,
  depositBalance: 0,
  winningsBalance: 0,
  winningBalance: 0,
  bonusCoins: 0,
  totalWon: 0,
  battlesPlayed: 0,
  battlesWon: 0,
};

export default function BattlePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState(DEFAULT_WALLET);
  const [activeTab, setActiveTab] = useState("automatch"); // "automatch" | "rooms" | "leaderboard" | "history"

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: "error" | "success" | "info" }
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Selected default stake (₹50 Entry -> ₹90 Prize)
  const [selectedStake, setSelectedStake] = useState({ entryFee: 50, prize: 90 });

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState("add");
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isHostBattle, setIsHostBattle] = useState(true);

  // 1v1 Challenge & Room Code State
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeOpponent, setChallengeOpponent] = useState(null);
  const [activeRoomCode, setActiveRoomCode] = useState("");
  const [quickRoomCodeInput, setQuickRoomCodeInput] = useState("");

  // Incoming Challenge from other live players
  const [incomingChallengeData, setIncomingChallengeData] = useState(null);
  const [isIncomingChallengeOpen, setIsIncomingChallengeOpen] = useState(false);

  // Active game state
  const [gameState, setGameState] = useState("idle"); // "idle" | "playing" | "game_over"
  const [currentOpponent, setCurrentOpponent] = useState(null);
  const [currentOpponents, setCurrentOpponents] = useState([]);
  const [currentGamePlayerCount, setCurrentGamePlayerCount] = useState(2);
  const [currentGamePrize, setCurrentGamePrize] = useState(90);
  const [currentGameStake, setCurrentGameStake] = useState(50);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const [gameResult, setGameResult] = useState(null); // { result: "WON" | "LOST", prize: number }

  // Custom Room Tab state
  const [customRoomStake, setCustomRoomStake] = useState(50);
  const [customRoomPlayers, setCustomRoomPlayers] = useState(4); // 2 | 3 | 4 Players
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [challengingPlayerId, setChallengingPlayerId] = useState(null);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Online players, live automatch rooms & custom rooms list
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(
    battleService.getOnlineOpponents().length === 0
  );
  const [liveAutoMatchRooms, setLiveAutoMatchRooms] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);

  // Refs for real-time socket event checking without stale closures
  const currentRoomCodeRef = useRef(currentRoomCode);
  currentRoomCodeRef.current = currentRoomCode;

  const activeRoomCodeRef = useRef(activeRoomCode);
  activeRoomCodeRef.current = activeRoomCode;

  const createdRoomCodeRef = useRef(createdRoomCode);
  createdRoomCodeRef.current = createdRoomCode;

  const isMatchmakingRef = useRef(isMatchmaking);
  isMatchmakingRef.current = isMatchmaking;

  const isChallengeModalOpenRef = useRef(isChallengeModalOpen);
  isChallengeModalOpenRef.current = isChallengeModalOpen;

  // Refresh wallet, dynamic live rooms, and initial data safely on mount (ONE TIME sync)
  useEffect(() => {
    setMounted(true);

    if (!isBattleReady) {
      router.replace("/user");
      return;
    }

    const myId = user?._id || user?.id || profile?.user?._id || profile?._id;
    const cleanMyId = String(myId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    const cleanMyName = (profile?.fullName || user?.fullName || profile?.name || user?.name || "").trim().toLowerCase();

    const filterMe = (players) => {
      if (!Array.isArray(players)) return [];
      return players.filter((p) => {
        const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        const pName = (p.name || p.fullName || "").trim().toLowerCase();
        if (cleanMyId && pId && pId === cleanMyId) return false;
        if (cleanMyName && pName && pName === cleanMyName) return false;
        return true;
      });
    };

    const handleWalletUpdated = (e) => {
      if (e.detail) {
        setWallet(e.detail);
      }
    };
    const handleAutoMatchUpdated = (e) => {
      setLiveAutoMatchRooms(e.detail || battleService.getLiveAutoMatchRooms());
    };
    const handleRoomsUpdated = (e) => {
      setActiveRooms(e.detail || battleService.getActiveRooms());
    };
    const handlePlayersUpdated = (e) => {
      const p = filterMe(e.detail || battleService.getOnlineOpponents(cleanMyId));
      setOnlinePlayers(p);
      if (Array.isArray(p) && p.length > 0) {
        setIsLoadingPlayers(false);
      }
    };

    window.addEventListener("pj-wallet-updated", handleWalletUpdated);
    window.addEventListener("pj-automatch-updated", handleAutoMatchUpdated);
    window.addEventListener("pj-rooms-updated", handleRoomsUpdated);
    window.addEventListener("pj-players-updated", handlePlayersUpdated);

    // Initialize immediately from cached memory
    setWallet(battleService.getWallet());
    setLiveAutoMatchRooms(battleService.getLiveAutoMatchRooms());
    setActiveRooms(battleService.getActiveRooms());
    const initialPlayers = filterMe(battleService.getOnlineOpponents(cleanMyId));
    setOnlinePlayers(initialPlayers);
    if (initialPlayers.length > 0) {
      setIsLoadingPlayers(false);
    }

    // Sync all rooms and opponents once with backend
    battleService.syncWithBackend().then(() => {
      setWallet(battleService.getWallet());
      setLiveAutoMatchRooms(battleService.getLiveAutoMatchRooms());
      setActiveRooms(battleService.getActiveRooms());
      const syncedPlayers = filterMe(battleService.getOnlineOpponents(cleanMyId));
      setOnlinePlayers(syncedPlayers);
      setIsLoadingPlayers(false);
    });

    return () => {
      window.removeEventListener("pj-wallet-updated", handleWalletUpdated);
      window.removeEventListener("pj-automatch-updated", handleAutoMatchUpdated);
      window.removeEventListener("pj-rooms-updated", handleRoomsUpdated);
      window.removeEventListener("pj-players-updated", handlePlayersUpdated);
    };
  }, []);

  // Ensure user registration and incoming challenge listener whenever user or socket is active
  useEffect(() => {
    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id;
    const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    const cleanMyName = (profile?.fullName || user?.fullName || profile?.name || user?.name || "").trim().toLowerCase();

    const bSock = getBattleSocket();
    const rSock = getSocket();

    if (myUserId) {
      if (bSock) registerBattleUserOnSocket(bSock, myUserId);
      if (rSock) registerBattleUserOnSocket(rSock, myUserId);
    }

    const handleIncomingChallenge = (data) => {
      console.log("⚔️ [Live Incoming Challenge Received]:", data);
      if (!data) return;

      const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanChallengerId = String(
        data.challenger?.userId || data.challenger?._id || data.challenger?.id || data.challenger || ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      const cleanTargetId = String(
        data.targetUserId || data.opponentUserId || data.targetId || ""
      ).trim().replace(/^(usr_|conv_|chat_|match_)/, "");

      // 1. Never open incoming challenge modal for the creator/challenger themselves!
      if (cleanMyId && cleanChallengerId && cleanMyId === cleanChallengerId) {
        return;
      }

      // 2. If targetUserId is set, only open if this client is the targeted recipient
      if (cleanMyId && cleanTargetId && cleanMyId !== cleanTargetId) {
        return;
      }

      setIncomingChallengeData(data);
      setIsIncomingChallengeOpen(true);
    };

    const handleGlobalMatchStarted = (data) => {
      if (!data) return;
      console.log("⚡ [Live Game Started / Match Found on Page Level]:", data);

      const rCode = String(data.roomId || data.roomCode || data.room?.roomId || data.room?.roomCode || "").trim().toUpperCase();
      if (!rCode) return;

      const cleanMyId = String(myUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      if (!cleanMyId) return;

      // Extract all player IDs involved in this match/room event
      const playerList = data.players || data.room?.players || [];
      const involvedUserIds = new Set();

      playerList.forEach((p) => {
        const pid = String(p?.userId || p?._id || p?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        if (pid) involvedUserIds.add(pid);
      });

      [
        data.hostUserId,
        data.targetUserId,
        data.opponentUserId,
        data.challengerUserId,
        data.challenger?.userId,
        data.challenger?._id,
        data.challenger?.id,
        data.host?.userId,
        data.host?._id,
        data.host?.id,
        data.user?.userId,
        data.user?._id,
        data.userDetails?.userId,
        data.userDetails?._id,
      ].forEach((id) => {
        const clean = String(id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        if (clean) involvedUserIds.add(clean);
      });

      const currentActiveRoom = String(
        currentRoomCodeRef.current || activeRoomCodeRef.current || createdRoomCodeRef.current || ""
      ).trim().toUpperCase();

      const isMyRoom = Boolean(currentActiveRoom && rCode && currentActiveRoom === rCode);
      const isUserInvolved = involvedUserIds.has(cleanMyId) || isMyRoom;

      // 1. STRICT: If current user is NOT involved in this room/match at all, ignore it!
      if (!isUserInvolved) {
        return;
      }

      // 2. Extract remote opponents (players who are NOT current user)
      const otherPlayers = playerList.filter((p) => {
        const pid = String(p?.userId || p?._id || p?.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        return pid && pid !== cleanMyId;
      });

      // Check if this event represents an actual guest joining or accepting
      const isAcceptedEvent = Boolean(
        data.isAccepted ||
        data.accepted ||
        data.status === "ACCEPTED" ||
        data.action === "accept" ||
        data.joinedPlayer
      );

      // Extract remote opponent
      let realOpponent = null;
      if (data.joinedPlayer && String(data.joinedPlayer.userId || data.joinedPlayer._id || data.joinedPlayer.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "") !== cleanMyId) {
        realOpponent = data.joinedPlayer;
      } else if (isAcceptedEvent && data.opponent && String(data.opponent.userId || data.opponent._id || data.opponent.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "") !== cleanMyId) {
        realOpponent = data.opponent;
      } else if (otherPlayers.length > 0 && isAcceptedEvent) {
        realOpponent = otherPlayers[0];
      }

      // 3. STRICT: If NO remote opponent has joined yet, DO NOT navigate! Stay in waiting state.
      if (!realOpponent) {
        console.log("⏳ [Waiting on Battle Page]: Room created/updated, waiting for opponent to join live.");
        return;
      }

      // 4. If Matchmaking modal or Challenge modal is active, let the modal UI handle the countdown and transition
      if (isMatchmakingRef.current || isChallengeModalOpenRef.current) {
        console.log("⏳ [Battle Page]: Matchmaking or Challenge modal is handling the transition.");
        return;
      }

      const resolvedOpponents = [realOpponent];

      // Close all modals once real opponent has entered
      setIsChallengeModalOpen(false);
      setIsIncomingChallengeOpen(false);
      setIsMatchmaking(false);
      setIsCreateRoomOpen(false);

      const rStake = Number(data.stakeAmount || data.stake || data.room?.stakeAmount || selectedStake?.entryFee || 50);
      const rPlayers = Number(data.maxPlayers || data.playerCount || data.room?.maxPlayers || 2);
      const rPrize = Number(data.prizeAmount || data.prize || data.room?.prizeAmount || battleService.calculatePrize(rStake, rPlayers));

      const amIHost = playerList[0] ? String(playerList[0].userId || playerList[0]._id || playerList[0].id).trim().replace(/^(usr_|conv_|chat_|match_)/, "") === cleanMyId : isHostBattle;

      navigateToGame(rCode, rStake, rPlayers, rPrize, resolvedOpponents, amIHost);
    };

    const handleLobbyRoomCreated = (room) => {
      console.log("⚡ [Real-time Room Created Broadcast Received]:", room);
      if (room) {
        battleService.addLiveRoom(room);
        setLiveAutoMatchRooms(battleService.getLiveAutoMatchRooms());
        setActiveRooms(battleService.getActiveRooms());
      }
    };

    const challengeEvents = [
      "battle:incoming_challenge",
      "incoming_challenge",
      "battle:challenge_received",
      "battle:room_invite",
      "battle_invite",
      "incoming_battle_challenge",
    ];

    const matchEvents = [
      "battle:challenge_accepted",
      "challenge_accepted",
      "battle:opponent_accepted",
      "opponent_accepted",
      "battle:opponent_entered_code",
    ];

    const handleRoomRemoved = (data) => {
      const cancelledCode = (
        data?.roomId ||
        data?.roomCode ||
        data?.customCode ||
        (typeof data === "string" ? data : "") ||
        ""
      )
        .toString()
        .trim()
        .toUpperCase();

      console.log("🚫 [Room Removed/Cancelled Broadcast Received]:", cancelledCode, data);

      if (cancelledCode) {
        battleService.removeLiveRoom(cancelledCode);
        setLiveAutoMatchRooms((prevRooms) =>
          prevRooms.filter(
            (r) =>
              (r.roomId || "").toUpperCase() !== cancelledCode &&
              (r.roomCode || "").toUpperCase() !== cancelledCode
          )
        );
        setActiveRooms((prevRooms) =>
          prevRooms.filter(
            (r) =>
              (r.roomId || "").toUpperCase() !== cancelledCode &&
              (r.roomCode || "").toUpperCase() !== cancelledCode
          )
        );

        // If currently open room or matchmaking was this cancelled room, notify and close
        const currentActive = (
          currentRoomCodeRef.current ||
          activeRoomCodeRef.current ||
          createdRoomCodeRef.current ||
          ""
        )
          .toString()
          .trim()
          .toUpperCase();

        if (currentActive && currentActive === cancelledCode) {
          if (!isHostBattle) {
            showToast(`Room ${cancelledCode} was cancelled by the host.`, "info");
            setIsMatchmaking(false);
            setIsChallengeModalOpen(false);
          }
        }
      }
    };

    const roomRemovedEvents = [
      "battle:lobby_room_removed",
      "battle:automatch_room_removed",
      "battle:room_cancelled",
      "battle:room_deleted",
      "battle:room_removed",
      "room_cancelled",
      "room_deleted",
      "room_removed",
      "lobby_room_removed",
      "automatch_room_removed",
    ];

    const lobbyRoomEvents = [
      "battle:lobby_room_created",
      "battle:new_room",
      "battle:automatch_room_added",
      "battle:rooms_updated",
      "battle:room_created",
    ];

    const handleSocketWallet = (data) => {
      if (data) {
        battleService.handleSocketWalletUpdated(data);
      }
    };

    const handleSocketOnlinePlayers = (data) => {
      if (data) {
        const formatted = battleService.handleSocketOnlinePlayersUpdated(data);
        const filtered = (formatted || []).filter((p) => {
          const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
          const pName = (p.name || p.fullName || "").trim().toLowerCase();
          if (cleanMyId && pId && pId === cleanMyId) return false;
          if (cleanMyName && pName && pName === cleanMyName) return false;
          return true;
        });
        if (filtered.length > 0) {
          setOnlinePlayers(filtered);
          setIsLoadingPlayers(false);
        }
      }
    };

    const walletEvents = ["battle:wallet_updated", "wallet_updated"];
    const onlinePlayersEvents = [
      "battle:online_players",
    ];

    const handleSocketError = (err) => {
      console.warn("⚠️ [Socket Battle Error]:", err);
      const msg = typeof err === "string" ? err : err?.message || err?.error || "Battle room error";
      showToast(msg, "error");
    };

    const socketErrorEvents = ["error", "battle:error", "connect_error"];

    if (bSock) {
      challengeEvents.forEach((evt) => bSock.on(evt, handleIncomingChallenge));
      matchEvents.forEach((evt) => bSock.on(evt, handleGlobalMatchStarted));
      lobbyRoomEvents.forEach((evt) => bSock.on(evt, handleLobbyRoomCreated));
      roomRemovedEvents.forEach((evt) => bSock.on(evt, handleRoomRemoved));
      walletEvents.forEach((evt) => bSock.on(evt, handleSocketWallet));
      onlinePlayersEvents.forEach((evt) => bSock.on(evt, handleSocketOnlinePlayers));
      socketErrorEvents.forEach((evt) => bSock.on(evt, handleSocketError));
      battleService.requestOnlinePlayersViaSocket();
    }
    if (rSock && rSock !== bSock) {
      challengeEvents.forEach((evt) => rSock.on(evt, handleIncomingChallenge));
      matchEvents.forEach((evt) => rSock.on(evt, handleGlobalMatchStarted));
      lobbyRoomEvents.forEach((evt) => rSock.on(evt, handleLobbyRoomCreated));
      roomRemovedEvents.forEach((evt) => rSock.on(evt, handleRoomRemoved));
      walletEvents.forEach((evt) => rSock.on(evt, handleSocketWallet));
      onlinePlayersEvents.forEach((evt) => rSock.on(evt, handleSocketOnlinePlayers));
      socketErrorEvents.forEach((evt) => rSock.on(evt, handleSocketError));
    }

    return () => {
      if (bSock) {
        challengeEvents.forEach((evt) => bSock.off(evt, handleIncomingChallenge));
        matchEvents.forEach((evt) => bSock.off(evt, handleGlobalMatchStarted));
        lobbyRoomEvents.forEach((evt) => bSock.off(evt, handleLobbyRoomCreated));
        roomRemovedEvents.forEach((evt) => bSock.off(evt, handleRoomRemoved));
        walletEvents.forEach((evt) => bSock.off(evt, handleSocketWallet));
        onlinePlayersEvents.forEach((evt) => bSock.off(evt, handleSocketOnlinePlayers));
        socketErrorEvents.forEach((evt) => bSock.off(evt, handleSocketError));
      }
      if (rSock && rSock !== bSock) {
        challengeEvents.forEach((evt) => rSock.off(evt, handleIncomingChallenge));
        matchEvents.forEach((evt) => rSock.off(evt, handleGlobalMatchStarted));
        lobbyRoomEvents.forEach((evt) => rSock.off(evt, handleLobbyRoomCreated));
        roomRemovedEvents.forEach((evt) => rSock.off(evt, handleRoomRemoved));
        walletEvents.forEach((evt) => rSock.off(evt, handleSocketWallet));
        onlinePlayersEvents.forEach((evt) => rSock.off(evt, handleSocketOnlinePlayers));
        socketErrorEvents.forEach((evt) => rSock.off(evt, handleSocketError));
      }
    };
  }, [user, profile, isHostBattle, selectedStake]);

  // Page Refresh / Unload Listener (Cancel active room if host leaves or refreshes page)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const code =
        createdRoomCodeRef.current ||
        activeRoomCodeRef.current ||
        (isHostBattle ? currentRoomCodeRef.current : null);
      const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id;
      if (code) {
        battleService.cancelBattleRoomOnUnload(code, myUserId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [user, profile, isHostBattle]);

  // Live ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Helper to route to dedicated /user/battle/game page
  const navigateToGame = (roomCode, stake, players, prize, matchedOpponents, isHost = true) => {
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    try {
      sessionStorage.setItem(
        "pj_active_battle",
        JSON.stringify({
          roomCode,
          stake,
          playerCount: players,
          prize,
          opponents: matchedOpponents,
          isHost,
          role: isHost ? "host" : "guest",
          userProfile: {
            userId: user?._id || user?.id || profile?.user?._id || profile?._id,
            name: myName,
            fullName: myName,
            avatar: myAvatar,
          },
        })
      );
    } catch { }
    router.push(
      `/user/battle/game?room=${encodeURIComponent(roomCode)}&stake=${stake}&players=${players}&prize=${prize}&role=${isHost ? "host" : "guest"}`
    );
  };

  // Handler for Opponent accepting incoming challenge
  const handleAcceptIncomingChallenge = (challenge) => {
    if (!challenge) return;
    const stakeAmount = Number(challenge.stakeAmount || 50);
    const prizeAmount = Number(challenge.prizeAmount || battleService.calculatePrize(stakeAmount, 2));
    const roomId = challenge.roomId || challenge.roomCode || "LUDO-7777";
    const rawChallenger = typeof challenge.challenger === "object" && challenge.challenger !== null ? challenge.challenger : {};

    const challengerId =
      rawChallenger.userId ||
      rawChallenger._id ||
      rawChallenger.id ||
      (typeof challenge.challenger === "string" ? challenge.challenger : null) ||
      challenge.challengerUserId ||
      challenge.hostUserId;

    let challengerName =
      rawChallenger.name ||
      rawChallenger.fullName ||
      challenge.challengerName ||
      challenge.hostName ||
      challenge.creatorName ||
      challenge.creator?.fullName ||
      challenge.creator?.name;

    let challengerAvatar =
      rawChallenger.avatar ||
      rawChallenger.photo ||
      rawChallenger.photos?.[0]?.url ||
      challenge.challengerAvatar ||
      challenge.hostAvatar ||
      challenge.creatorAvatar ||
      challenge.creator?.avatar;

    if (!challengerName || challengerName.toLowerCase() === "user" || challengerName.toLowerCase() === "player" || challengerName.toLowerCase() === "a challenger") {
      if (challengerId) {
        const cleanId = String(challengerId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        const matched = battleService.getOnlineOpponents().find((p) => {
          const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
          return pId && cleanId && pId === cleanId;
        });
        if (matched) {
          challengerName = matched.name || matched.fullName || challengerName;
          if (matched.avatar) challengerAvatar = matched.avatar;
        }
        if (!challengerName || challengerName.toLowerCase() === "user") {
          const matchedRoom = battleService.getActiveRooms().find((r) => {
            const rHostId = String(r.hostUserId || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
            return (rHostId && cleanId && rHostId === cleanId) || (r.roomCode && roomId && r.roomCode === roomId);
          });
          if (matchedRoom && matchedRoom.hostName) {
            challengerName = matchedRoom.hostName;
            if (matchedRoom.hostAvatar) challengerAvatar = matchedRoom.hostAvatar;
          }
        }
      }
    }

    const challenger = {
      ...rawChallenger,
      userId: challengerId,
      name: challengerName || "Challenger",
      fullName: challengerName || "Challenger",
      avatar: challengerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    };

    try {
      battleService.deductEntryFee(stakeAmount);
      setWallet(battleService.getWallet());
    } catch (e) { }

    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    const userDetails = { userId: myUserId, name: myName, avatar: myAvatar };

    try {
      battleService.acceptChallengeViaSocket({
        roomId,
        challengerUserId: challenger.userId || challenger.id || challenger._id,
        userDetails,
      });
      battleService.joinBattleRoomViaSocket({
        userId: myUserId,
        userDetails,
        roomId,
      });
    } catch (e) {
      console.warn("Socket join on accept notice:", e);
    }

    setIsIncomingChallengeOpen(false);

    // Opponent launches directly into the game arena with the Challenger (role: guest)
    navigateToGame(roomId, stakeAmount, 2, prizeAmount, [challenger], false);
  };

  // Handler for Opponent declining incoming challenge
  const handleDeclineIncomingChallenge = (challenge) => {
    if (challenge) {
      const challenger = challenge.challenger || {};
      battleService.rejectChallengeViaSocket({
        roomId: challenge.roomId,
        challengerUserId: challenger.userId || challenger.id || challenger._id,
      });
    }
    setIsIncomingChallengeOpen(false);
    setIncomingChallengeData(null);
  };

  // 1. Challenge Player Action (generates Room Code via Backend & opens ChallengeModal)
  const handleChallengePlayer = async (player) => {
    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < selectedStake.entryFee) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    // Check battle creation eligibility with backend (GET /battle/can-create-battle)
    try {
      const check = await battleService.checkCanCreateBattle();
      if (!check.canCreate && check.hasWaitingRoom) {
        const msg = check.message || `You already have an active battle room (${check.activeRoomId}) waiting for an opponent. Please cancel it before challenging.`;
        showToast(msg, "error");
        if (check.activeRoomId) {
          setCreatedRoomCode(check.activeRoomId);
        }
        return;
      }
    } catch (e) {
      console.warn("Check can create battle error:", e);
    }

    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player 1";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    let generatedCode = "";
    try {
      // Request backend to generate and reserve room
      const created = await battleService.createCustomRoom({
        stake: selectedStake.entryFee,
        playerCount: 2,
        hostName: myName,
        hostAvatar: myAvatar,
        hostCity: profile?.city || user?.city || "Arena",
      });
      generatedCode = created?.roomCode || "";
    } catch (err) {
      console.warn("Challenge room creation error:", err);
      const msg = err?.message || "Failed to create challenge room";
      showToast(msg, "error");
      if (err?.activeRoomCode) {
        generatedCode = err.activeRoomCode;
      } else {
        return;
      }
    }

    if (!generatedCode) return;

    setActiveRoomCode(generatedCode);
    setChallengeOpponent(player);
    setIsChallengeModalOpen(true);

    const targetUserId = player.userId || player.id || player._id;

    try {
      // Join host socket to the room
      battleService.joinBattleRoomViaSocket({
        userId: myUserId,
        userDetails: { name: myName, avatar: myAvatar },
        roomId: generatedCode,
      });

      battleService.challengePlayerViaSocket({
        targetUserId,
        opponentUserId: targetUserId,
        challenger: { userId: myUserId, name: myName, fullName: myName, avatar: myAvatar },
        challengerName: myName,
        challengerAvatar: myAvatar,
        hostName: myName,
        hostAvatar: myAvatar,
        stakeAmount: selectedStake.entryFee,
        prizeAmount: selectedStake.prize || Math.floor(selectedStake.entryFee * 1.8),
        roomId: generatedCode,
      });
    } catch (e) {
      console.warn("Socket challenge notice:", e);
    }
  };

  // 2. Start Game from Challenge Modal
  const handleStartGameFromChallenge = (opponent, stakeAmount, roomCode) => {
    try {
      battleService.deductEntryFee(selectedStake.entryFee);
      setWallet(battleService.getWallet());
    } catch {
      // Allow seamless start in dev simulation
    }

    const oppToUse = opponent || challengeOpponent || {};
    const oppId = oppToUse.userId || oppToUse._id || oppToUse.id;
    let oppName = oppToUse.name || oppToUse.fullName;
    let oppAvatar = oppToUse.avatar || oppToUse.photo || oppToUse.photos?.[0]?.url;

    if (!oppName || oppName.toLowerCase() === "user" || oppName.toLowerCase() === "player" || oppName.toLowerCase() === "opponent") {
      if (oppId) {
        const cleanId = String(oppId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
        const matched = battleService.getOnlineOpponents().find((p) => {
          const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
          return pId && cleanId && pId === cleanId;
        });
        if (matched) {
          oppName = matched.name || matched.fullName;
          if (matched.avatar) oppAvatar = matched.avatar;
        }
      }
    }

    const resolvedOpponent = {
      ...oppToUse,
      userId: oppId,
      name: oppName || challengeOpponent?.name || "Opponent",
      fullName: oppName || challengeOpponent?.fullName || "Opponent",
      avatar: oppAvatar || challengeOpponent?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    };

    setIsChallengeModalOpen(false);
    navigateToGame(
      roomCode,
      stakeAmount || selectedStake.entryFee,
      2,
      selectedStake?.prize || 90,
      [resolvedOpponent],
      true
    );
  };

  // 3. Quick Join via Header Room Code Input
  const handleQuickJoinRoom = async (e) => {
    e.preventDefault();
    if (!quickRoomCodeInput.trim()) return;

    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < selectedStake.entryFee) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player 2";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    const code = quickRoomCodeInput.trim().toUpperCase();
    setQuickRoomCodeInput("");

    let initialStake = selectedStake.entryFee;
    let initialPlayers = 2;
    let initialPrize = battleService.calculatePrize(selectedStake.entryFee, 2);
    let hostOpponent = {
      userId: "host_opp",
      name: "Host",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      city: "Arena",
      isReady: true,
    };

    try {
      const roomData = await battleService.joinRoomByCode(code);
      if (roomData) {
        initialStake = Number(roomData.stakeAmount || roomData.stake || initialStake);
        initialPlayers = Number(roomData.maxPlayers || roomData.playerCount || 2);
        initialPrize = Number(roomData.prizeAmount || roomData.prize || battleService.calculatePrize(initialStake, initialPlayers));

        const creator =
          roomData.creator ||
          roomData.host ||
          roomData.players?.find((p) => p.isHost) ||
          roomData.players?.[0];

        if (creator && String(creator.userId || creator._id || creator.id) !== String(myUserId)) {
          hostOpponent = {
            userId: creator.userId || creator._id || creator.id,
            name: creator.name || creator.fullName || hostOpponent.name,
            avatar: creator.avatar || creator.photos?.[0]?.url || hostOpponent.avatar,
            city: creator.city || "Arena",
            isReady: true,
          };
        }
      }
    } catch (err) {
      console.warn("Join room by code error:", err);
      showToast(err?.message || `Battle room ${code} not found or inactive.`, "error");
      return;
    }

    try {
      battleService.deductEntryFee(initialStake);
      setWallet(battleService.getWallet());
    } catch { }

    try {
      battleService.joinBattleRoomViaSocket({
        userId: myUserId,
        userDetails: { name: myName, avatar: myAvatar },
        roomId: code,
      });
    } catch (err) {
      console.warn("Socket join room notice:", err);
    }

    // Open Matchmaking Modal as guest for smooth sync and countdown
    setIsHostBattle(false);
    setCurrentRoomCode(code);
    setCurrentGameStake(initialStake);
    setCurrentGamePlayerCount(initialPlayers);
    setCurrentGamePrize(initialPrize);
    setCurrentOpponents([hostOpponent]);
    setCurrentOpponent(hostOpponent);
    setIsMatchmaking(true);
  };

  // 4. Custom Room Tab: Generate Code via Backend & Sync to AutoMatch Lobby
  const handleCreateRoom = async () => {
    if (isGeneratingRoom) return;
    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < customRoomStake) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    // Check battle creation eligibility with backend (GET /battle/can-create-battle)
    try {
      const check = await battleService.checkCanCreateBattle();
      if (!check.canCreate && check.hasWaitingRoom) {
        const msg = check.message || `You already have an active battle room (${check.activeRoomId}) waiting for an opponent. Please wait or cancel it before creating a new battle.`;
        showToast(msg, "error");
        if (check.activeRoomId) {
          setCreatedRoomCode(check.activeRoomId);
          if (check.activeRoom?.stakeAmount) setCustomRoomStake(Number(check.activeRoom.stakeAmount));
          if (check.activeRoom?.maxPlayers) setCustomRoomPlayers(Number(check.activeRoom.maxPlayers));
        }
        return;
      }
    } catch (e) {
      console.warn("Check can create battle in create room error:", e);
    }

    setIsGeneratingRoom(true);
    try {
      const hostName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player 1";
      const hostAvatar =
        profile?.photos?.[0]?.url ||
        user?.photos?.[0]?.url ||
        profile?.photos?.[0] ||
        profile?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

      const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();

      // Call backend API to create room and generate official code
      const created = await battleService.createCustomRoom({
        stake: customRoomStake,
        playerCount: customRoomPlayers,
        hostName,
        hostAvatar,
        hostCity: profile?.city || user?.city || "Mumbai",
      });

      const code = created?.roomCode || "LUDO-" + Math.floor(1000 + Math.random() * 9000);
      setCreatedRoomCode(code);

      const newRoomObj = {
        id: code,
        roomId: code,
        roomCode: code,
        hostUserId: myUserId,
        hostName,
        hostAvatar,
        hostCity: profile?.city || user?.city || "Mumbai",
        stake: customRoomStake,
        playerCount: customRoomPlayers,
        currentSlots: 1,
        prize: battleService.calculatePrize(customRoomStake, customRoomPlayers),
        createdAt: "Active Now",
        status: "WAITING",
        isUserCreated: true,
      };

      battleService.addLiveRoom(newRoomObj);
      setLiveAutoMatchRooms(battleService.getLiveAutoMatchRooms());
      setActiveRooms(battleService.getActiveRooms());

      try {
        battleService.createBattleRoomViaSocket({
          userId: myUserId,
          userDetails: { name: hostName, avatar: hostAvatar },
          stakeAmount: customRoomStake,
          customCode: code,
        });
      } catch (e) {
        console.warn("Socket create room notice:", e);
      }
      showToast(`🎉 Room ${code} created successfully! Waiting for opponent.`, "success");
    } catch (err) {
      console.warn("Create room error:", err?.message || err);
      const msg = err?.message || "Failed to create battle room";
      showToast(msg, "error");
      if (err?.activeRoomCode) {
        setCreatedRoomCode(err.activeRoomCode);
      }
    } finally {
      setIsGeneratingRoom(false);
    }
  };

  const handleOpenCreateCustomRoomModal = async () => {
    try {
      const check = await battleService.checkCanCreateBattle();
      if (!check.canCreate && check.hasWaitingRoom) {
        const msg = check.message || `You already have an active battle room (${check.activeRoomId}) waiting for an opponent.`;
        showToast(msg, "info");
        if (check.activeRoomId) {
          setCreatedRoomCode(check.activeRoomId);
          if (check.activeRoom?.stakeAmount) setCustomRoomStake(Number(check.activeRoom.stakeAmount));
          if (check.activeRoom?.maxPlayers) setCustomRoomPlayers(Number(check.activeRoom.maxPlayers));
        }
      }
    } catch (err) {
      console.warn("Check can create battle modal open error:", err);
    }
    setIsCreateRoomOpen(true);
  };

  const handleCancelCreatedRoom = async (codeToCancel) => {
    const code = codeToCancel || createdRoomCode;
    if (!code) return;
    try {
      await battleService.cancelBattleRoom(code, user?._id || user?.id || profile?.user?._id || profile?._id);
      setCreatedRoomCode("");
      setActiveRoomCode("");
      showToast(`Room ${code} has been cancelled successfully.`, "success");
    } catch (err) {
      showToast("Failed to cancel room: " + (err?.message || "Error"), "error");
    }
  };

  const handleCloseCreateRoomModal = async () => {
    if (createdRoomCode) {
      await handleCancelCreatedRoom(createdRoomCode);
    }
    setIsCreateRoomOpen(false);
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5. Join Room from AutoMatch Lobby
  const handleJoinSelectedRoom = (room) => {
    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < room.stake) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player 2";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    const hostOpponent = {
      userId: room.hostUserId || room.id || "host_opp",
      name: room.hostName || "Host",
      avatar:
        room.hostAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      city: room.hostCity || "Arena",
      isReady: true,
    };

    try {
      battleService.deductEntryFee(room.stake);
      setWallet(battleService.getWallet());
    } catch { }

    try {
      battleService.joinBattleRoomViaSocket({
        userId: myUserId,
        userDetails: { name: myName, avatar: myAvatar },
        roomId: room.roomCode,
      });
      battleService.joinRoomByCode(room.roomCode);
    } catch (e) {
      console.warn("Socket join room notice:", e);
    }

    // Open Matchmaking Modal as guest for smooth sync and countdown
    setIsHostBattle(false);
    setCurrentRoomCode(room.roomCode);
    setCurrentGameStake(room.stake);
    setCurrentGamePlayerCount(room.playerCount);
    setCurrentGamePrize(room.prize);
    setCurrentOpponents([hostOpponent]);
    setCurrentOpponent(hostOpponent);
    setIsMatchmaking(true);
  };

  // 6. Start Custom Room with Auto-Matching (2, 3, or 4 Players)
  const handleStartCustomRoomAutoMatch = () => {
    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < customRoomStake) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    const prizeCalculated = battleService.calculatePrize(customRoomStake, customRoomPlayers);

    setIsHostBattle(true);
    setCurrentOpponent(null);
    setCurrentOpponents([]);
    setCurrentGamePlayerCount(customRoomPlayers);
    setCurrentGameStake(customRoomStake);
    setCurrentGamePrize(prizeCalculated);
    setCurrentRoomCode(createdRoomCode || null);

    // Launch radar auto-matchmaking modal first (strictly 1 player waiting)
    setIsMatchmaking(true);
  };

  const handleJoinCustomRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomCode.trim()) return;

    const totalBalance = Number(wallet?.balance ?? 0);
    if (totalBalance < customRoomStake) {
      setWalletModalTab("add");
      setIsWalletOpen(true);
      return;
    }

    const myUserId = user?._id || user?.id || profile?.user?._id || profile?._id || "user_" + Date.now();
    const myName = profile?.fullName || user?.fullName || profile?.name || user?.name || "Player 2";
    const myAvatar =
      profile?.photos?.[0]?.url ||
      user?.photos?.[0]?.url ||
      profile?.photos?.[0] ||
      profile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

    const code = joinRoomCode.trim().toUpperCase();
    setJoinRoomCode("");

    const foundRoom =
      activeRooms.find((r) => r.roomCode === code || r.roomId === code) ||
      liveAutoMatchRooms.find((r) => r.roomCode === code || r.roomId === code);

    let initialStake = customRoomStake;
    let initialPlayers = customRoomPlayers;
    let initialPrize = battleService.calculatePrize(customRoomStake, customRoomPlayers);
    let hostOpponent = {
      userId: "host_opp",
      name: "Host",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      city: "Arena",
      isReady: true,
    };

    if (foundRoom) {
      initialStake = foundRoom.stake || customRoomStake;
      initialPlayers = foundRoom.playerCount || customRoomPlayers;
      initialPrize =
        foundRoom.prize || battleService.calculatePrize(initialStake, initialPlayers);
      if (foundRoom.hostName) {
        hostOpponent = {
          userId: foundRoom.hostUserId || foundRoom.id || "host_opp",
          name: foundRoom.hostName,
          avatar: foundRoom.hostAvatar,
          city: foundRoom.hostCity || "Arena",
          isReady: true,
        };
      }
    }

    try {
      battleService.deductEntryFee(initialStake);
      setWallet(battleService.getWallet());
    } catch { }

    try {
      battleService.joinBattleRoomViaSocket({
        userId: myUserId,
        userDetails: { name: myName, avatar: myAvatar },
        roomId: code,
      });
    } catch (err) {
      console.warn("Socket join room notice:", err);
    }

    battleService.joinRoomByCode(code).then((roomData) => {
      if (roomData) {
        const creator =
          roomData.creator ||
          roomData.host ||
          roomData.players?.find((p) => p.isHost) ||
          roomData.players?.[0];
        if (
          creator &&
          String(creator.userId || creator._id || creator.id) !== String(myUserId)
        ) {
          hostOpponent = {
            userId: creator.userId || creator._id || creator.id,
            name: creator.name || creator.fullName || hostOpponent.name,
            avatar:
              creator.avatar || creator.photos?.[0]?.url || hostOpponent.avatar,
            city: creator.city || "Arena",
            isReady: true,
          };
          try {
            sessionStorage.setItem(
              "pj_active_battle",
              JSON.stringify({
                roomCode: code,
                stake: initialStake,
                playerCount: initialPlayers,
                prize: initialPrize,
                opponents: [hostOpponent],
                isHost: false,
                role: "guest",
              })
            );
          } catch { }
        }
      }
    }).catch(() => { });

    // Directly launch into the game arena with role: guest
    navigateToGame(
      code,
      initialStake,
      initialPlayers,
      initialPrize,
      [hostOpponent],
      false
    );
  };

  // Game End Handler
  const handleGameOver = async (result, prize, details = {}) => {
    if (result === "WON") {
      await battleService.creditWinnings(prize, currentOpponent, currentGameStake, {
        roomId: currentRoomCode,
        roomCode: currentRoomCode,
        ...details,
      });
    } else {
      await battleService.recordLoss(currentOpponent, currentGameStake, {
        roomId: currentRoomCode,
        roomCode: currentRoomCode,
        ...details,
      });
    }
    setGameResult({ result, prize });
    setGameState("game_over");
  };

  return (
    <div className="w-full space-y-6 pb-16 select-none">
      {/* Top Floating Live Activity Ticker */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 text-white text-xs font-medium py-2.5 px-4 text-center overflow-hidden flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
        <span className="animate-in fade-in duration-500">
          {LIVE_TICKERS[tickerIndex]}
        </span>
      </div>

      <div className="w-full space-y-6">
        {/* Header with Title & Quick Room Code Join */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-[15px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium mb-1.5">
              <Swords className="w-3.5 h-3.5" />
              Real Cash 1v1 Ludo Arena
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Online Ludo 1v1 Battles
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
              Join live battle rooms, challenge online players & win instant cash prizes!
            </p>
          </div>

          {/* Quick Room Code Input */}
          <div className="flex items-center gap-3">
            {/* Fast Room Code Joiner */}
            <form
              onSubmit={handleQuickJoinRoom}
              className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-2xs w-full sm:w-auto"
            >
              <KeyRound className="w-4 h-4 text-rose-500 ml-2" />
              <input
                type="text"
                value={quickRoomCodeInput}
                onChange={(e) => setQuickRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                className="bg-transparent text-xs font-medium uppercase w-36 px-2 py-1.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickRoomCodeInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-xs disabled:opacity-50 hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Join</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "automatch", label: "⚡ Live AutoMatch", icon: Zap, badge: liveAutoMatchRooms.length > 0 ? liveAutoMatchRooms.length : null },
            { id: "leaderboard", label: "Top Earners", icon: Trophy },
            { id: "history", label: "Battle History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${isActive ? "bg-white text-rose-600" : "bg-emerald-500 text-white"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Rules & Fairplay</span>
          </button>
        </div>

        {/* TAB 1: LIVE AUTOMATCH ROOMS */}
        {activeTab === "automatch" && (
          <AutoMatchRoomsList
            rooms={liveAutoMatchRooms}
            onJoinRoom={handleJoinSelectedRoom}
            onCreateRoomClick={handleOpenCreateCustomRoomModal}
          />
        )}

        {/* CREATE CUSTOM ROOM MODAL */}
        {isCreateRoomOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={handleCloseCreateRoomModal}
            />
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-rose-500">
                  <Crown className="w-5 h-5" />
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                    Create Custom Battle Room
                  </h3>
                </div>
                <button
                  onClick={handleCloseCreateRoomModal}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                Select number of players (2 to 4 players) & stake. Auto-match live players or invite friends!
              </p>

              {/* 1. NUMBER OF PLAYERS SELECTION (2, 3, 4 PLAYERS) */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
                  <span>Select Number of Players</span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Win Pool: ₹{battleService.calculatePrize(customRoomStake, customRoomPlayers)}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 2, label: "2 Players", sub: "1 vs 1 Battle", icon: "👥" },
                    { count: 3, label: "3 Players", sub: "3-Way Clash", icon: "⚡" },
                    { count: 4, label: "4 Players", sub: "4-Player Battle", icon: "👑" },
                  ].map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => {
                        setCustomRoomPlayers(opt.count);
                        if (createdRoomCode) setCreatedRoomCode("");
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${customRoomPlayers === opt.count
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm scale-[1.02]"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-xs">{opt.icon}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. STAKE SELECTOR */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Battle Stake (₹ per player)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setCustomRoomStake(amt);
                        if (createdRoomCode) setCreatedRoomCode("");
                      }}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${customRoomStake === amt
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Prize Callout */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {customRoomPlayers} Players • ₹{customRoomStake} Stake
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-normal">Total Win Cash</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{battleService.calculatePrize(customRoomStake, customRoomPlayers)}
                  </span>
                </div>
              </div>

              {!createdRoomCode ? (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isGeneratingRoom}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating {customRoomPlayers}-Player Room Code...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Generate {customRoomPlayers}-Player Room Code</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      Room Code ({customRoomPlayers} Players):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                      Active & Ready
                    </span>
                  </div>

                  {/* Code Pill & Copy Button */}
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="text-lg font-mono font-semibold text-rose-600 dark:text-rose-400 tracking-wider">
                      {createdRoomCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-500/20 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const prizeCalc = battleService.calculatePrize(customRoomStake, customRoomPlayers);
                          const text = `Join my ${customRoomPlayers}-Player Ludo Battle on Prem Jodo! Stake: ₹${customRoomStake}, Prize: ₹${prizeCalc}. Enter Room Code: ${createdRoomCode} 👉 ${window.location.origin}/user/battle`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player Slots Indicators */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between">
                      <span>Player Slots (1 of {customRoomPlayers} filled)</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Auto-matching enabled</span>
                    </div>
                    <div className={`grid gap-1.5 ${customRoomPlayers === 2 ? "grid-cols-2" : customRoomPlayers === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                      <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/40 text-center">
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 block truncate">You (Host)</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">🔵 Ready</span>
                      </div>
                      {Array.from({ length: customRoomPlayers - 1 }).map((_, idx) => {
                        const colors = ["🟢 Player 2", "🔴 Player 3", "🟡 Player 4"];
                        return (
                          <div key={idx} className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-dashed border-zinc-300 dark:border-zinc-700 text-center animate-pulse">
                            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block truncate">
                              {colors[idx] || `Player ${idx + 2}`}
                            </span>
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">Auto-fill ⚡</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Start Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCancelCreatedRoom(createdRoomCode)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Room</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateRoomOpen(false);
                        handleStartCustomRoomAutoMatch();
                      }}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-medium shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>Auto-Match {customRoomPlayers} Players & Start Battle ⚔️</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="p-[15px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Top Cash Champions Today 🏆
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                  Rankings update every 15 minutes with top cash prizes
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                Daily Pool: ₹50,000
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-2">
              {battleService.getLeaderboard().map((player) => (
                <div
                  key={player.rank}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${player.rank === 1
                    ? "bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/40"
                    : player.rank === 2
                      ? "bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
                      : player.rank === 3
                        ? "bg-orange-50/80 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30"
                        : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${player.rank === 1
                        ? "bg-amber-400 text-black shadow-sm"
                        : player.rank === 2
                          ? "bg-zinc-600 text-white"
                          : player.rank === 3
                            ? "bg-orange-400 text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                    >
                      {player.rank}
                    </div>

                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                    />

                    <div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-white">
                        {player.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                        {player.city} • {player.wins} Wins ({player.winRate})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {player.earnings}
                    </div>
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-normal">Won Today</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BATTLE HISTORY */}
        {activeTab === "history" && (
          <div className="p-[15px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Your 1v1 Battle Log
              </h3>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                Battles Played: <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{wallet.battlesPlayed || 0}</strong> • Won:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-medium">{wallet.battlesWon || 0}</strong>
              </div>
            </div>

            <div className="space-y-2">
              {battleService.getBattleHistory().map((match) => (
                <div
                  key={match.id}
                  className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-semibold ${match.result === "WON"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}
                    >
                      {match.result === "WON" ? "W" : "L"}
                    </div>

                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        vs {match.opponentName}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                        {match.mode} • Stake: ₹{match.entryFee} • {match.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-semibold ${match.result === "WON" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                    >
                      {match.result === "WON" ? `+₹${match.prize}` : `-₹${match.entryFee}`}
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${match.result === "WON"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                    >
                      {match.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1v1 CHALLENGE & ROOM CODE MODAL */}
        <ChallengeModal
          isOpen={isChallengeModalOpen}
          opponent={challengeOpponent}
          myUserId={user?._id || user?.id || profile?.user?._id || profile?._id}
          stake={selectedStake?.entryFee}
          prize={selectedStake?.prize}
          roomCode={activeRoomCode}
          onStartGame={handleStartGameFromChallenge}
          onCancel={() => {
            if (activeRoomCode) {
              handleCancelCreatedRoom(activeRoomCode);
            }
            setIsChallengeModalOpen(false);
          }}
        />

        {/* INCOMING 1v1 CHALLENGE MODAL ON OPPONENT'S SCREEN */}
        <IncomingChallengeModal
          isOpen={isIncomingChallengeOpen}
          challengeData={incomingChallengeData}
          onAccept={handleAcceptIncomingChallenge}
          onDecline={() => handleDeclineIncomingChallenge(incomingChallengeData)}
        />

        {/* WALLET MODAL */}
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          initialTab={walletModalTab}
          onWalletUpdated={() => setWallet(battleService.getWallet())}
        />

        {/* MULTIPLAYER AUTOMATCHING MODAL */}
        <MatchmakingModal
          isOpen={isMatchmaking}
          stake={currentGameStake}
          prize={currentGamePrize}
          playerCount={currentGamePlayerCount}
          roomCode={currentRoomCode}
          opponent={currentOpponent}
          opponents={currentOpponents}
          userProfile={profile || user}
          isHost={isHostBattle}
          onMatchFound={(finalOpponents, matchedCode) => {
            const opponentsToUse =
              finalOpponents && finalOpponents.length > 0
                ? finalOpponents
                : currentOpponents;
            if (!opponentsToUse || opponentsToUse.length === 0) {
              console.log("⏳ [MatchmakingModal]: Waiting for real opponent to join...");
              return;
            }
            setIsMatchmaking(false);
            navigateToGame(
              matchedCode || currentRoomCode || "LUDO-7777",
              currentGameStake,
              currentGamePlayerCount,
              currentGamePrize,
              opponentsToUse,
              isHostBattle
            );
          }}
          onCancel={() => {
            const codeToCancel = currentRoomCode || activeRoomCode || createdRoomCode;
            if (codeToCancel && isHostBattle) {
              handleCancelCreatedRoom(codeToCancel);
            } else if (codeToCancel) {
              battleService.leaveBattleRoomViaSocket({
                roomId: codeToCancel,
                userId: user?._id || user?.id || profile?.user?._id || profile?._id,
              });
            }
            setIsMatchmaking(false);
          }}
        />

        {/* RULES MODAL */}
        {isRulesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsRulesOpen(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 z-10 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Ludo 1v1 Battle Rules</h3>
                <button onClick={() => setIsRulesOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">✕</button>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <p>🎲 <strong>Rolling a 6</strong> unlocks a pawn from base and grants a bonus turn.</p>
                <p>⭐ <strong>Star Squares</strong> are safe zones where tokens cannot be captured.</p>
                <p>⚔️ <strong>1 vs 1 Battle</strong>: Challenge any online player directly with a generated room code.</p>
                <p>🎯 <strong>First player to take both pawns home</strong> wins the cash prize pool immediately!</p>
                <p>⚡ <strong>15-Second Turn Timer</strong>: If a roll is missed within 15s, the turn automatically passes.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsRulesOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs cursor-pointer hover:opacity-95 shadow-md shadow-rose-500/20"
              >
                Got It, Let&apos;s Play!
              </button>
            </div>
          </div>
        )}

        {/* GLOBAL TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed top-6 right-6 z-[99999] transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4">
            <div
              className={`flex items-start gap-3.5 p-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md backdrop-blur-xl relative overflow-hidden ${toast.type === "success"
                  ? "bg-[#0b1f14]/95 border-emerald-500/50 text-white shadow-emerald-500/20"
                  : toast.type === "info"
                    ? "bg-[#0c192e]/95 border-blue-500/50 text-white shadow-blue-500/20"
                    : "bg-[#250810]/95 border-rose-500/50 text-white shadow-rose-500/20"
                }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : toast.type === "info"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
              >
                {toast.type === "success" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 pr-2">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-zinc-300">
                  {toast.type === "success" ? "Success" : "Notice / Error"}
                </h4>
                <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
