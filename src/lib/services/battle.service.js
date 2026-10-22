"use client";

import { apiFetch } from "./apiClient";
import { getBattleSocket, getSocket } from "./socket.service";

/**
 * Pure Dynamic In-Memory Battle Service
 * All state is managed dynamically via live Backend API & WebSockets.
 */
class BattleService {
  constructor() {
    this.isSyncing = false;
    this.hasSyncedOnce = false;
    this.lastSyncTime = 0;
    this.walletLoaded = false;
    this.lastWalletTime = 0;
    this.lastAutoMatchTime = 0;
    this.lastRoomsTime = 0;
    this.lastPlayersTime = 0;
    this.lastLeaderboardTime = 0;
    this.lastHistoryTime = 0;
    this._fetchPromises = {};

    // Pure dynamic in-memory state
    this.wallet = {
      balance: 0,
      depositBalance: 0,
      winningsBalance: 0,
      winningBalance: 0,
      bonusCoins: 0,
      bonusBalance: 0,
      totalWon: 0,
      battlesPlayed: 0,
      battlesWon: 0,
    };
    this.liveAutoMatchRooms = this.generateDefaultLiveRooms();
    this.activeRooms = this.generateDefaultLiveRooms();
    this.onlinePlayers = [];
    this.leaderboard = [];
    this.history = [];
    this.transactions = [];

    // Clean up any stale localStorage battle keys if present
    if (typeof window !== "undefined") {
      try {
        [
          "pj_battle_wallet",
          "pj_battle_history",
          "pj_battle_leaderboard",
          "pj_battle_active_rooms",
          "pj_battle_online_players",
          "pj_battle_txs",
        ].forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
  }

  // ==========================================================
  // 1. WALLET ENDPOINTS & STATE
  // - GET  /battle/wallet
  // - POST /battle/wallet/add-money
  // - POST /battle/wallet/withdraw
  // ==========================================================

  getWallet() {
    return { ...this.wallet };
  }

  saveWallet(wallet) {
    if (!wallet) return;
    this.wallet = { ...this.wallet, ...wallet };

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("pj-wallet-updated", { detail: { ...this.wallet } })
        );
      } catch {
        // ignore
      }
    }
  }

  getTotalBalance() {
    return Number(this.wallet?.balance ?? 0);
  }

  /**
   * Fetch wallet dynamically from Backend API (GET /battle/wallet)
   */
  async fetchWalletFromBackend(force = false) {
    if (!force && this.walletLoaded && Date.now() - this.lastWalletTime < 30000) {
      return this.getWallet();
    }

    if (this._fetchPromises["wallet"]) {
      return this._fetchPromises["wallet"];
    }

    this._fetchPromises["wallet"] = (async () => {
      try {
        const res = await apiFetch("/battle/wallet", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const data = json?.data || json?.wallet || json;
          if (data && typeof data.balance !== "undefined") {
            const depositBalance = Number(data.depositBalance ?? 0);
            const winningsBalance = Number(
              data.winningBalance ?? data.winningsBalance ?? 0
            );
            const totalBalance = Number(data.balance ?? 0);
            const bonusBalance = Number(
              data.bonusBalance ?? data.bonusCoins ?? 0
            );

            const updatedWallet = {
              balance: totalBalance,
              depositBalance,
              winningsBalance,
              winningBalance: winningsBalance,
              bonusCoins: bonusBalance,
              bonusBalance,
              totalWon: Number(data.totalWon ?? data.totalEarnings ?? 0),
              battlesPlayed: Number(
                data.battlesPlayed ?? data.totalBattles ?? 0
              ),
              battlesWon: Number(data.battlesWon ?? data.totalWins ?? 0),
            };
            this.wallet = updatedWallet;
            this.walletLoaded = true;
            this.lastWalletTime = Date.now();
            this.saveWallet(updatedWallet);
            return updatedWallet;
          }
        }
      } catch (err) {
        console.warn("[battleService] fetchWalletFromBackend:", err?.message);
      } finally {
        this._fetchPromises["wallet"] = null;
      }
      return this.getWallet();
    })();

    return this._fetchPromises["wallet"];
  }

  /**
   * Add Cash to Wallet (POST /battle/wallet/add-money)
   */
  async addCash(amount, paymentMethod = "UPI") {
    const num = Number(amount) || 0;
    this.wallet.depositBalance = (this.wallet.depositBalance || 0) + num;
    this.wallet.balance = (this.wallet.balance || 0) + num;
    this.saveWallet(this.wallet);

    this.addTransaction({
      type: "DEPOSIT",
      amount: num,
      paymentMethod,
      title: `Added Cash via ${paymentMethod}`,
      date: "Just now",
      status: "SUCCESS",
    });

    try {
      const res = await apiFetch("/battle/wallet/add-money", {
        method: "POST",
        body: JSON.stringify({ amount: num, paymentMethod }),
      });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const data = json?.data || json?.wallet;
        if (data) {
          await this.fetchWalletFromBackend();
        }
      }
    } catch (err) {
      console.warn("[battleService] addMoneyToWallet backend sync:", err?.message);
    }

    return this.getWallet();
  }

  /**
   * Withdraw Winnings (POST /battle/wallet/withdraw)
   */
  async withdrawWinnings(amount, upiId) {
    const num = Number(amount) || 0;
    const currentWin =
      this.wallet.winningsBalance || this.wallet.winningBalance || 0;
    if (currentWin < num) {
      throw new Error("Insufficient winnings balance to withdraw.");
    }
    const newWin = currentWin - num;
    this.wallet.winningsBalance = newWin;
    this.wallet.winningBalance = newWin;
    this.wallet.balance = Math.max(0, (this.wallet.balance || 0) - num);
    this.saveWallet(this.wallet);

    this.addTransaction({
      type: "WITHDRAW",
      amount: num,
      upiId,
      title: `Withdrawal to ${upiId}`,
      date: "Just now",
      status: "SUCCESS",
    });

    try {
      const res = await apiFetch("/battle/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: num, upiId }),
      });
      if (res && res.ok) {
        await this.fetchWalletFromBackend();
      }
    } catch (err) {
      console.warn("[battleService] withdrawMoneyFromWallet backend sync:", err?.message);
    }

    return this.getWallet();
  }

  deductEntryFee(fee) {
    const total = this.getTotalBalance();
    if (total < fee) {
      throw new Error(
        `Insufficient wallet balance. You need ₹${fee} to enter this battle.`
      );
    }
    return true;
  }

  handleSocketWalletUpdated(data) {
    if (!data) return this.getWallet();
    const wallet = data.wallet || data;
    if (wallet && typeof wallet.balance !== "undefined") {
      const depositBalance = Number(wallet.depositBalance ?? 0);
      const winningsBalance = Number(
        wallet.winningBalance ?? wallet.winningsBalance ?? 0
      );
      const totalBalance = Number(wallet.balance ?? 0);
      const bonusBalance = Number(
        wallet.bonusBalance ?? wallet.bonusCoins ?? 0
      );

      const updatedWallet = {
        balance: totalBalance,
        depositBalance,
        winningsBalance,
        winningBalance: winningsBalance,
        bonusCoins: bonusBalance,
        bonusBalance,
        totalWon: Number(wallet.totalWon ?? wallet.totalEarnings ?? this.wallet.totalWon ?? 0),
        battlesPlayed: Number(
          wallet.battlesPlayed ?? wallet.totalBattles ?? this.wallet.battlesPlayed ?? 0
        ),
        battlesWon: Number(wallet.battlesWon ?? wallet.totalWins ?? this.wallet.battlesWon ?? 0),
      };
      this.saveWallet(updatedWallet);
      return updatedWallet;
    }
    return this.getWallet();
  }

  async creditWinnings(prize, opponent, entryFee, matchDetails = {}) {
    const numPrize = Number(prize) || 0;
    const newRecord = {
      id: "btl-" + Date.now(),
      opponentName: opponent?.name || opponent?.fullName || "Opponent",
      opponentAvatar: opponent?.avatar || opponent?.photos?.[0]?.url || "",
      entryFee: Number(entryFee) || 0,
      prize: numPrize,
      result: "WON",
      date: "Just now",
      mode: matchDetails.mode || "1v1 Battle",
    };
    this.history.unshift(newRecord);

    return this.getWallet();
  }

  async recordLoss(opponent, entryFee, matchDetails = {}) {
    const newRecord = {
      id: "btl-" + Date.now(),
      opponentName: opponent?.name || opponent?.fullName || "Opponent",
      opponentAvatar: opponent?.avatar || opponent?.photos?.[0]?.url || "",
      entryFee: Number(entryFee) || 0,
      prize: 0,
      result: "LOST",
      date: "Just now",
      mode: matchDetails.mode || "1v1 Battle",
    };
    this.history.unshift(newRecord);

    return this.getWallet();
  }

  // ==========================================================
  // 2. LIVE AUTOMATCH & CUSTOM ROOM ENDPOINTS
  // - GET /battle/live-automatch (Dedicated for Live AutoMatch)
  // - GET /battle/rooms (Dedicated for Custom Room Code rooms)
  // ==========================================================

  generateDefaultLiveRooms() {
    return [

    ];
  }

  getLiveAutoMatchRooms() {
    if (!this.liveAutoMatchRooms || this.liveAutoMatchRooms.length === 0) {
      this.liveAutoMatchRooms = this.generateDefaultLiveRooms();
    }
    return [...this.liveAutoMatchRooms];
  }

  saveLiveAutoMatchRooms(rooms) {
    this.liveAutoMatchRooms = Array.isArray(rooms) ? rooms.slice(0, 50) : [];
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("pj-automatch-updated", {
            detail: this.liveAutoMatchRooms,
          })
        );
      } catch {
        // ignore
      }
    }
  }

  /**
   * Fetch from Dedicated Live AutoMatch API (GET /battle/live-automatch)
   */
  async fetchLiveAutoMatchFromBackend(force = false) {
    if (!force && this.liveAutoMatchRooms.length > 0 && Date.now() - this.lastAutoMatchTime < 30000) {
      return this.getLiveAutoMatchRooms();
    }

    if (this._fetchPromises["automatch"]) {
      return this._fetchPromises["automatch"];
    }

    this._fetchPromises["automatch"] = (async () => {
      try {
        const res = await apiFetch("/battle/live-automatch", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const raw =
            json?.data?.rooms ||
            json?.rooms ||
            (Array.isArray(json?.data) ? json.data : null) ||
            [];

          if (Array.isArray(raw)) {
            const formatted = raw.map((r, i) => {
              const hostPlayer =
                (r.players &&
                  Array.isArray(r.players) &&
                  r.players.find((p) => p.isHost)) ||
                r.players?.[0] ||
                r.creator ||
                {};
              const hostName =
                r.hostName ||
                hostPlayer.name ||
                hostPlayer.fullName ||
                r.creator?.fullName ||
                "Host";
              const hostAvatar =
                r.hostAvatar ||
                hostPlayer.avatar ||
                r.creator?.avatar ||
                `https://images.unsplash.com/photo-${1534528741775 + (i * 37)}?w=300&auto=format&fit=crop&q=80`;
              const code = (
                r.roomId ||
                r.roomCode ||
                r.customCode ||
                `AUTO-${3000 + i}`
              ).toUpperCase();
              const stake = Number(r.stakeAmount || r.stake || 50);
              const playerCount = Number(r.maxPlayers || r.playerCount || 4);
              const prize = Number(
                r.prizeAmount ||
                r.prize ||
                this.calculatePrize(stake, playerCount)
              );

              return {
                id: r._id || r.id || `auto-${i}`,
                roomId: code,
                roomCode: code,
                hostUserId: hostPlayer.userId || r.hostUserId || "",
                hostName,
                hostAvatar,
                hostCity: r.hostCity || "Arena",
                stake,
                playerCount,
                currentSlots: Number(r.currentSlots || r.players?.length || 1),
                prize,
                createdAt: "Active Now",
                status: r.status || "WAITING",
                isUserCreated: Boolean(r.isUserCreated),
              };
            });
            this.saveLiveAutoMatchRooms(formatted);
            this.lastAutoMatchTime = Date.now();
            return formatted;
          }
        }
      } catch (err) {
        console.warn("[battleService] fetchLiveAutoMatchFromBackend:", err?.message);
      } finally {
        this._fetchPromises["automatch"] = null;
      }
      return this.getLiveAutoMatchRooms();
    })();

    return this._fetchPromises["automatch"];
  }

  getActiveRooms() {
    return [...this.activeRooms];
  }

  saveActiveRooms(rooms) {
    this.activeRooms = Array.isArray(rooms) ? rooms.slice(0, 50) : [];
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("pj-rooms-updated", { detail: this.activeRooms })
        );
      } catch {
        // ignore
      }
    }
  }

  /**
   * Real-time handler to add or update a room dynamically from socket broadcast
   */
  addLiveRoom(room) {
    if (!room) return;
    const rCode = (room.roomCode || room.roomId || room.customCode || "").toString().trim().toUpperCase();
    if (!rCode) return;

    const normalized = {
      id: room.id || room._id || room.roomId || rCode,
      roomId: rCode,
      roomCode: rCode,
      hostUserId: room.hostUserId || room.creator || "",
      hostName: room.hostName || "Host",
      hostAvatar:
        room.hostAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      hostCity: room.hostCity || "Arena",
      stake: Number(room.stake || room.stakeAmount || 50),
      playerCount: Number(room.playerCount || room.maxPlayers || 2),
      currentSlots: Number(room.currentSlots || 1),
      prize: Number(
        room.prize ||
        room.prizeAmount ||
        this.calculatePrize(room.stake || 50, room.playerCount || 2)
      ),
      createdAt: "Active Now",
      status: room.status || "WAITING",
      isUserCreated: Boolean(room.isUserCreated ?? true),
    };

    const updatedAutoMatch = [
      normalized,
      ...this.liveAutoMatchRooms.filter((r) => r.roomCode !== rCode),
    ];
    this.saveLiveAutoMatchRooms(updatedAutoMatch);

    const updatedActive = [
      normalized,
      ...this.activeRooms.filter((r) => r.roomCode !== rCode),
    ];
    this.saveActiveRooms(updatedActive);

    return normalized;
  }

  /**
   * Real-time handler to remove a room dynamically from socket cancellation broadcast
   */
  removeLiveRoom(roomCodeOrId) {
    if (!roomCodeOrId) return;
    const code = (
      typeof roomCodeOrId === "object"
        ? roomCodeOrId.roomId || roomCodeOrId.roomCode || roomCodeOrId.customCode || roomCodeOrId.id
        : roomCodeOrId
    )
      .toString()
      .trim()
      .toUpperCase();

    if (!code) return;

    this.liveAutoMatchRooms = this.liveAutoMatchRooms.filter(
      (r) => (r.roomCode || "").toUpperCase() !== code && (r.roomId || "").toUpperCase() !== code && (r.id || "").toUpperCase() !== code
    );
    this.activeRooms = this.activeRooms.filter(
      (r) => (r.roomCode || "").toUpperCase() !== code && (r.roomId || "").toUpperCase() !== code && (r.id || "").toUpperCase() !== code
    );

    this.saveLiveAutoMatchRooms(this.liveAutoMatchRooms);
    this.saveActiveRooms(this.activeRooms);
  }

  /**
   * Fetch custom rooms created with room code from backend (GET /battle/rooms)
   */
  async fetchActiveRoomsFromBackend(force = false) {
    if (!force && this.activeRooms.length > 0 && Date.now() - this.lastRoomsTime < 30000) {
      return this.getActiveRooms();
    }

    if (this._fetchPromises["rooms"]) {
      return this._fetchPromises["rooms"];
    }

    this._fetchPromises["rooms"] = (async () => {
      try {
        const res = await apiFetch("/battle/rooms", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const rooms =
            json?.data?.rooms ||
            json?.rooms ||
            (Array.isArray(json?.data) ? json.data : null) ||
            [];

          if (Array.isArray(rooms)) {
            const formatted = rooms.map((r, i) => {
              const hostPlayer =
                (r.players &&
                  Array.isArray(r.players) &&
                  r.players.find((p) => p.isHost)) ||
                r.players?.[0] ||
                r.creator ||
                {};
              const hostName =
                r.hostName ||
                hostPlayer.name ||
                hostPlayer.fullName ||
                r.creator?.fullName ||
                r.creator?.name ||
                r.host?.name ||
                "Room Host";
              const hostAvatar =
                r.hostAvatar ||
                hostPlayer.avatar ||
                hostPlayer.photos?.[0]?.url ||
                hostPlayer.photo ||
                r.creator?.avatar ||
                r.creator?.photos?.[0]?.url ||
                `https://images.unsplash.com/photo-${1534528741775 + (i * 37)}?w=300&auto=format&fit=crop&q=80`;
              const hostCity =
                r.hostCity ||
                hostPlayer.city ||
                hostPlayer.location?.city ||
                hostPlayer.location ||
                r.creator?.location?.city ||
                "Arena";
              const stake = Number(r.stakeAmount || r.stake || r.entryFee || 50);
              const playerCount = Number(r.maxPlayers || r.playerCount || 2);
              const prize = Number(
                r.prizeAmount ||
                r.prize ||
                this.calculatePrize(stake, playerCount)
              );

              return {
                id: r._id || r.id || `room-${i}`,
                roomId: (
                  r.roomId ||
                  r.roomCode ||
                  r.code ||
                  r.customCode ||
                  `LUDO-${3000 + i}`
                ).toUpperCase(),
                roomCode: (
                  r.roomId ||
                  r.roomCode ||
                  r.code ||
                  r.customCode ||
                  `LUDO-${3000 + i}`
                ).toUpperCase(),
                hostUserId:
                  hostPlayer.userId || hostPlayer._id || r.hostUserId || "",
                hostName,
                hostAvatar,
                hostCity,
                stake,
                playerCount,
                currentSlots: Number(r.currentSlots || r.players?.length || 1),
                prize,
                createdAt: r.createdAt
                  ? typeof r.createdAt === "string" && !r.createdAt.includes("-")
                    ? r.createdAt
                    : "Active Now"
                  : "Active Now",
                status: r.status || "WAITING",
                isUserCreated: Boolean(r.isUserCreated),
              };
            });
            this.saveActiveRooms(formatted);
            this.lastRoomsTime = Date.now();
            return formatted;
          }
        }
      } catch (err) {
        console.warn("[battleService] fetchActiveRoomsFromBackend:", err?.message);
      } finally {
        this._fetchPromises["rooms"] = null;
      }
      return this.getActiveRooms();
    })();

    return this._fetchPromises["rooms"];
  }

  /**
   * Generate Room Code from backend API (GET /battle/rooms/generate-code)
   */
  async generateRoomCode() {
    try {
      const res = await apiFetch("/battle/rooms/generate-code", {
        method: "GET",
      });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const code =
          json?.data?.roomCode ||
          json?.roomCode ||
          json?.code ||
          json?.data?.code ||
          json?.roomId ||
          json?.data?.roomId ||
          json?.data;
        if (code && typeof code === "string") return code.trim().toUpperCase();
      }
    } catch (err) {
      console.warn("[battleService] generateRoomCode GET fallback:", err?.message);
    }

    try {
      const res = await apiFetch("/battle/rooms/generate-code", {
        method: "POST",
      });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const code =
          json?.data?.roomCode ||
          json?.roomCode ||
          json?.code ||
          json?.data?.code ||
          json?.roomId ||
          json?.data?.roomId ||
          json?.data;
        if (code && typeof code === "string") return code.trim().toUpperCase();
      }
    } catch (err) {
      console.warn("[battleService] generateRoomCode POST fallback:", err?.message);
    }

    return "LUDO-" + Math.floor(1000 + Math.random() * 9000);
  }

  /**
   * Check Battle Creation Eligibility (GET /battle/can-create-battle)
   */
  async checkCanCreateBattle() {
    try {
      const res = await apiFetch("/battle/can-create-battle", {
        method: "GET",
      });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const data = json?.data || json;
        const canCreate = Boolean(
          typeof data?.canCreate !== "undefined"
            ? data.canCreate
            : typeof data?.canCreateBattle !== "undefined"
              ? data.canCreateBattle
              : true
        );
        const hasWaitingRoom = Boolean(data?.hasWaitingRoom);
        const activeRoomId = (
          data?.activeRoomId ||
          data?.activeRoom?.roomId ||
          data?.activeRoom?.roomCode ||
          ""
        ).toString().trim().toUpperCase();

        return {
          canCreate,
          canCreateBattle: canCreate,
          hasWaitingRoom,
          activeRoomId: activeRoomId || null,
          activeRoom: data?.activeRoom || null,
          message: data?.message || json?.message || "",
        };
      }
    } catch (err) {
      console.warn("[battleService] checkCanCreateBattle error:", err?.message);
    }
    return {
      canCreate: true,
      canCreateBattle: true,
      hasWaitingRoom: false,
      activeRoomId: null,
      activeRoom: null,
      message: "",
    };
  }

  /**
   * Create custom room on backend (POST /battle/rooms/create)
   */
  async createCustomRoom(roomData) {
    let generatedCode = roomData.roomCode;
    let backendRoom = null;

    try {
      const res = await apiFetch("/battle/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          stake: Number(roomData.stake || 50),
          stakeAmount: Number(roomData.stake || 50),
          playerCount: Number(roomData.playerCount || 4),
          hostName: roomData.hostName || "You",
          hostAvatar:
            roomData.hostAvatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
          hostCity: roomData.hostCity || "Arena",
          customCode: generatedCode,
          roomCode: generatedCode,
        }),
      });

      const json = await res?.json().catch(() => ({}));

      if (res && res.ok) {
        backendRoom = json?.data?.room || json?.data || json?.room || json;
        if (backendRoom) {
          generatedCode =
            backendRoom.roomId ||
            backendRoom.roomCode ||
            backendRoom.code ||
            generatedCode;
        }
      } else {
        const errorMsg = json?.message || json?.error || "Failed to create battle room";
        const match = errorMsg.match(/\(([A-Z0-9\-]+)\)/);
        const existingRoomCode = match ? match[1] : null;

        const error = new Error(errorMsg);
        error.statusCode = res?.status || 400;
        error.activeRoomCode = existingRoomCode;
        error.data = json;
        throw error;
      }
    } catch (err) {
      console.warn("[battleService] createCustomRoom backend API error:", err?.message);
      throw err;
    }

    if (!generatedCode) {
      generatedCode = "LUDO-" + Math.floor(1000 + Math.random() * 9000);
    }

    const newRoom = {
      id: backendRoom?._id || backendRoom?.id || "room-" + Date.now(),
      roomId: generatedCode,
      roomCode: generatedCode,
      hostName: roomData.hostName || "You",
      hostAvatar:
        roomData.hostAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      hostCity: roomData.hostCity || "Arena",
      stake: Number(roomData.stake || 50),
      playerCount: Number(roomData.playerCount || 4),
      currentSlots: 1,
      prize: Number(
        backendRoom?.prizeAmount ||
        backendRoom?.prize ||
        this.calculatePrize(roomData.stake || 50, roomData.playerCount || 4)
      ),
      createdAt: "Just now",
      status: backendRoom?.status || "WAITING",
      isUserCreated: true,
    };

    const filtered = this.activeRooms.filter((r) => r.roomCode !== generatedCode);
    filtered.unshift(newRoom);
    this.saveActiveRooms(filtered);

    return newRoom;
  }

  /**
   * Cancel Battle Room via Socket (Tareeqa 2)
   */
  cancelBattleViaSocket(roomCode, userId = null, callback = null) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const code = roomCode ? roomCode.toString().trim().toUpperCase() : "";
    const uId = userId ? userId.toString() : "";
    const payload = { roomId: code, roomCode: code, userId: uId };

    if (bSock && code) {
      bSock.emit("battle:cancel_room", payload, (res) => {
        console.log("Cancel Ack (bSock):", res);
        if (callback) callback(res);
      });
      bSock.emit("cancel_room", payload);
      bSock.emit("battle:delete_room", payload);
      bSock.emit("delete_room", payload);
    }
    if (rSock && rSock !== bSock && code) {
      rSock.emit("battle:cancel_room", payload, (res) => {
        console.log("Cancel Ack (rSock):", res);
        if (callback) callback(res);
      });
      rSock.emit("cancel_room", payload);
      rSock.emit("battle:delete_room", payload);
      rSock.emit("delete_room", payload);
    }
  }

  /**
   * Cancel Battle Room on Unload / Refresh (Beacon / keepalive)
   */
  cancelBattleRoomOnUnload(roomId, userId = null) {
    const code = roomId ? roomId.toString().trim().toUpperCase() : "";
    if (!code || typeof window === "undefined") return;

    try {
      this.cancelBattleViaSocket(code, userId);
      this.leaveBattleRoomViaSocket({ roomId: code, userId });
      this.removeLiveRoom(code);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const token =
        localStorage.getItem("pj_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const cancelUrl = `${apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl}/battle/rooms/${code}/cancel`;
      fetch(cancelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ roomId: code, roomCode: code, userId }),
        keepalive: true,
      }).catch(() => { });
    } catch { }
  }

  /**
   * Cancel Battle Room (Tareeqa 1 & 2 combined)
   */
  async cancelBattleRoom(roomId, userId = null) {
    try {
      const code = roomId ? roomId.toString().trim().toUpperCase() : "";
      if (code) {
        // 1. Socket emit cancel (Tareeqa 2)
        this.cancelBattleViaSocket(code, userId);
        this.leaveBattleRoomViaSocket({ roomId: code, userId });

        // 2. REST API cancellation (Tareeqa 1)
        await apiFetch(`/battle/rooms/${code}/cancel`, { method: "POST" }).catch(() => { });
        await apiFetch(`/battle/rooms/${code}`, { method: "DELETE" }).catch(() => { });
        await apiFetch(`/battle/rooms/cancel`, { method: "POST", body: JSON.stringify({ roomId: code, roomCode: code, userId }) }).catch(() => { });

        // 3. Local removal
        this.removeLiveRoom(code);
      }
      return true;
    } catch (err) {
      console.warn("[battleService] cancelBattleRoom error:", err?.message);
      throw err;
    }
  }

  /**
   * Join Room by Code (POST /battle/rooms/join)
   */
  async joinRoomByCode(roomCode) {
    try {
      const code = roomCode ? roomCode.toString().trim().toUpperCase() : "";
      const res = await apiFetch("/battle/rooms/join", {
        method: "POST",
        body: JSON.stringify({ roomId: code, roomCode: code }),
      });
      const json = await res?.json().catch(() => ({}));
      if (res && res.ok) {
        return json?.data?.room || json?.data || json?.room || json;
      } else {
        const errorMsg = json?.message || json?.error || "Battle room not found";
        const err = new Error(errorMsg);
        err.statusCode = res?.status || 404;
        throw err;
      }
    } catch (err) {
      console.warn("[battleService] joinRoomByCode error:", err?.message);
      throw err;
    }
  }

  /**
   * Get Room Details (GET /battle/rooms/:roomId)
   */
  async getRoomDetails(roomId) {
    try {
      const res = await apiFetch(`/battle/rooms/${roomId}`, { method: "GET" });
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        return json?.data || json?.room || json;
      }
    } catch (err) {
      console.warn("[battleService] getRoomDetails error:", err?.message);
    }
    return null;
  }

  // ==========================================================
  // 3. LIVE ONLINE PLAYERS, HISTORY & LEADERBOARD
  // - GET /battle/online-players
  // - GET /battle/history
  // - GET /battle/leaderboard
  // ==========================================================

  getOnlineOpponents(excludeUserId = null) {
    if (!excludeUserId) return [...this.onlinePlayers];
    const cleanExclude = String(excludeUserId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    return this.onlinePlayers.filter((p) => {
      const pId = String(p.userId || p._id || p.id || "").trim().replace(/^(usr_|conv_|chat_|match_)/, "");
      return !cleanExclude || !pId || pId !== cleanExclude;
    });
  }

  saveOnlineOpponents(players) {
    this.onlinePlayers = Array.isArray(players) ? players : [];
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("pj-players-updated", { detail: this.onlinePlayers })
        );
      } catch {
        // ignore
      }
    }
  }

  /**
   * Fetch live online players dynamically (API feed + Socket)
   */
  async fetchOnlinePlayersFromBackend(force = false) {
    if (!force && this.onlinePlayers.length > 0 && Date.now() - this.lastPlayersTime < 30000) {
      return this.getOnlineOpponents();
    }

    try {
      const res = await apiFetch("/matches/feed", { method: "GET" }).catch(() => null);
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const list = json?.data?.profiles || json?.data || (Array.isArray(json) ? json : null);
        if (Array.isArray(list) && list.length > 0) {
          const formatted = this.handleSocketOnlinePlayersUpdated(list);
          this.lastPlayersTime = Date.now();
          return formatted;
        }
      }
    } catch { }

    return new Promise((resolve) => {
      const bSock = this.getBattleSocket();
      const rSock = this.getSocket();
      const sock = bSock || rSock;

      if (!sock) {
        return resolve(this.getOnlineOpponents());
      }

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(this.getOnlineOpponents());
        }
      }, 3500);

      const callbackHandler = (res) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        const data = res?.players || res?.data || res;
        const formatted = this.handleSocketOnlinePlayersUpdated(data);
        resolve(formatted || this.getOnlineOpponents());
      };

      try {
        if (bSock) {
          bSock.emit("battle:get_online_players", {}, callbackHandler);
          bSock.emit("get_online_players", {}, callbackHandler);
          bSock.emit("online_players", {}, callbackHandler);
        }
        if (rSock && rSock !== bSock) {
          rSock.emit("battle:get_online_players", {}, callbackHandler);
          rSock.emit("get_online_players", {}, callbackHandler);
          rSock.emit("online_players", {}, callbackHandler);
        }
      } catch {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(this.getOnlineOpponents());
        }
      }
    });
  }

  /**
   * Real-time online players socket handler
   */
  handleSocketOnlinePlayersUpdated(data) {
    if (!data) return this.getOnlineOpponents();
    const raw =
      data.players ||
      data.onlinePlayers ||
      data.users ||
      data.data ||
      (Array.isArray(data) ? data : null) ||
      [];
    if (Array.isArray(raw) && raw.length > 0) {
      const formatted = raw.map((p, i) => {
        const pid = p.userId || p._id || p.id || `opp-${i}`;
        const photo =
          p.avatar ||
          p.photo ||
          p.photos?.[0]?.url ||
          p.photos?.[0] ||
          `https://images.unsplash.com/photo-${1534528741775 + (i * 37)}?w=300&auto=format&fit=crop&q=80`;
        const cityName = p.city || p.location?.city || p.location || "Nearby";
        const winRateStr = typeof p.winRate === "string" ? p.winRate : `${p.winRate || 75}%`;
        const totalWinsNum = Number(p.matchesWon || p.totalWins || p.wins || 50);
        const totalEarnedStr =
          typeof p.totalEarned === "string"
            ? p.totalEarned
            : typeof p.totalWon === "string"
              ? p.totalWon
              : `₹${p.totalEarned || p.totalWon || p.earnings || 5000}`;

        return {
          id: pid,
          userId: pid,
          _id: pid,
          name: p.name || p.fullName || "Active Player",
          fullName: p.fullName || p.name || "Active Player",
          age: p.age || 24,
          avatar: photo,
          photo: photo,
          city: cityName,
          location: cityName,
          winRate: winRateStr,
          totalWins: totalWinsNum,
          matchesWon: totalWinsNum,
          totalEarned: totalEarnedStr,
          totalWon: totalEarnedStr,
          badge: p.badge || (totalWinsNum > 50 ? "Ludo Master" : "Pro Battler"),
          status: "Online Now",
          isMatch: Boolean(p.isMatch !== false),
          isOnline: true,
        };
      });
      this.saveOnlineOpponents(formatted);
      return formatted;
    }
    return this.getOnlineOpponents();
  }

  requestOnlinePlayersViaSocket() {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    if (bSock) {
      bSock.emit("battle:get_online_players");
      bSock.emit("get_online_players");
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:get_online_players");
      rSock.emit("get_online_players");
    }
  }

  getLeaderboard() {
    return [...this.leaderboard];
  }

  /**
   * Fetch Leaderboard dynamically (GET /battle/leaderboard)
   */
  async fetchLeaderboardFromBackend(force = false) {
    if (!force && this.leaderboard.length > 0 && Date.now() - this.lastLeaderboardTime < 60000) {
      return this.getLeaderboard();
    }

    if (this._fetchPromises["leaderboard"]) {
      return this._fetchPromises["leaderboard"];
    }

    this._fetchPromises["leaderboard"] = (async () => {
      try {
        const res = await apiFetch("/battle/leaderboard", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const leaderboard =
            json?.data?.leaderboard ||
            json?.leaderboard ||
            (Array.isArray(json?.data) ? json.data : null) ||
            [];
          if (Array.isArray(leaderboard) && leaderboard.length > 0) {
            const formatted = leaderboard.map((item, idx) => ({
              rank: item.rank || idx + 1,
              name: item.name || item.fullName || item.user?.name || `Player ${idx + 1}`,
              city: item.city || item.user?.city || "Arena",
              avatar:
                item.avatar ||
                item.user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
              earnings:
                item.earnings ||
                item.totalWon ||
                `₹${item.totalWinnings || item.totalEarned || 1000}`,
              wins: item.wins || item.matchesWon || item.totalWins || 10,
              winRate: typeof item.winRate === "string" ? item.winRate : `${item.winRate || 70}%`,
            }));
            this.leaderboard = formatted;
            this.lastLeaderboardTime = Date.now();
            return formatted;
          }
        }
      } catch (err) {
        console.warn("[battleService] fetchLeaderboardFromBackend:", err?.message);
      } finally {
        this._fetchPromises["leaderboard"] = null;
      }
      return this.getLeaderboard();
    })();

    return this._fetchPromises["leaderboard"];
  }

  getBattleHistory() {
    return [...this.history];
  }

  saveBattleHistory(history) {
    this.history = Array.isArray(history) ? history.slice(0, 50) : [];
  }

  /**
   * Fetch Battle History dynamically (GET /battle/history)
   */
  async fetchBattleHistoryFromBackend(force = false) {
    if (!force && this.history.length > 0 && Date.now() - this.lastHistoryTime < 60000) {
      return this.getBattleHistory();
    }

    if (this._fetchPromises["history"]) {
      return this._fetchPromises["history"];
    }

    this._fetchPromises["history"] = (async () => {
      try {
        const res = await apiFetch("/battle/history", { method: "GET" });
        if (res && res.ok) {
          const json = await res.json().catch(() => ({}));
          const history =
            json?.data?.history ||
            json?.history ||
            (Array.isArray(json?.data) ? json.data : null) ||
            [];
          if (Array.isArray(history) && history.length > 0) {
            const formatted = history.map((item, idx) => ({
              id: item._id || item.id || `btl-${idx}`,
              opponentName: item.opponentName || item.opponent?.name || "Opponent",
              opponentAvatar:
                item.opponentAvatar ||
                item.opponent?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
              entryFee: Number(item.entryFee || item.stake || 50),
              prize: Number(item.prize || item.winnings || 0),
              result: item.result || (item.winner ? "WON" : "LOST"),
              date: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Recently",
              mode: item.mode || "1v1 Quick",
            }));
            this.saveBattleHistory(formatted);
            this.lastHistoryTime = Date.now();
            return formatted;
          }
        }
      } catch (err) {
        console.warn("[battleService] fetchBattleHistoryFromBackend:", err?.message);
      } finally {
        this._fetchPromises["history"] = null;
      }
      return this.getBattleHistory();
    })();

    return this._fetchPromises["history"];
  }

  getRandomOpponent(excludeUserId = null) {
    const opps = this.getOnlineOpponents(excludeUserId);
    if (!opps || opps.length === 0) return null;
    const idx = Math.floor(Math.random() * opps.length);
    return opps[idx];
  }

  getMultipleOpponents(count = 1, excludeUserId = null) {
    const opps = this.getOnlineOpponents(excludeUserId);
    if (!opps || opps.length === 0) return [];
    const shuffled = [...opps].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, opps.length));
  }

  calculatePrize(entryFee = 50, playerCount = 2) {
    return Math.floor(entryFee * playerCount * 0.9);
  }

  addTransaction(tx) {
    this.transactions.unshift({ ...tx, id: "tx-" + Date.now() });
    if (this.transactions.length > 50) {
      this.transactions = this.transactions.slice(0, 50);
    }
  }

  getTransactions() {
    return [...this.transactions];
  }

  // ==========================================================
  // 4. REAL-TIME BATTLE SOCKET HELPERS (Matching battleSocket.js)
  // ==========================================================

  getBattleSocket() {
    return getBattleSocket() || getSocket();
  }

  getSocket() {
    return getSocket();
  }

  /**
   * 1. Join AutoMatch matchmaking queue (battle:join_automatch)
   */
  joinAutoMatchQueue({ userId, name, avatar, stakeAmount = 50 }) {
    const sock = this.getBattleSocket();
    if (sock && userId) {
      sock.emit("battle:join_automatch", {
        userId: userId.toString(),
        name,
        avatar,
        stakeAmount: Number(stakeAmount) || 50,
      });
    }
  }

  /**
   * Cancel AutoMatch queue (battle:cancel_automatch)
   */
  cancelAutoMatchQueue({ userId, stakeAmount = 50 }) {
    const sock = this.getBattleSocket();
    if (sock && userId) {
      sock.emit("battle:cancel_automatch", {
        userId: userId.toString(),
        stakeAmount: Number(stakeAmount) || 50,
      });
    }
  }

  /**
   * 2. Create custom room via socket (battle:create_room)
   */
  createBattleRoomViaSocket(
    { userId, userDetails, stakeAmount = 50, customCode },
    callback
  ) {
    const sock = this.getBattleSocket();
    if (sock && userId) {
      sock.emit(
        "battle:create_room",
        { userId, userDetails, stakeAmount, customCode },
        callback
      );
    }
  }

  /**
   * Join custom room via socket (battle:join_room)
   */
  joinBattleRoomViaSocket({ userId, userDetails, roomId }, callback) {
    const sock = this.getBattleSocket();
    if (sock && userId && roomId) {
      sock.emit(
        "battle:join_room",
        { userId, userDetails, roomId: roomId.trim().toUpperCase() },
        callback
      );
    }
  }

  /**
   * Challenge another player directly (battle:challenge_player)
   */
  challengePlayerViaSocket(payload, callback) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const targetId =
      payload?.targetUserId ||
      payload?.opponentUserId ||
      payload?.opponent?.userId ||
      payload?.opponent?._id ||
      payload?.opponent?.id;

    if (!targetId) return;

    const data = {
      ...payload,
      targetUserId: targetId.toString(),
      opponentUserId: targetId.toString(),
      stakeAmount: Number(payload.stakeAmount) || 50,
      roomId: payload.roomId ? payload.roomId.trim().toUpperCase() : undefined,
    };

    if (bSock) {
      bSock.emit("battle:challenge_player", data, callback);
      bSock.emit("challenge_player", data, callback);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:challenge_player", data, callback);
      rSock.emit("challenge_player", data, callback);
    }
  }

  /**
   * Opponent accepts a 1v1 challenge (battle:accept_challenge)
   */
  acceptChallengeViaSocket({ roomId, challengerUserId, userDetails, userId }, callback) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const uId = userId || userDetails?.userId || userDetails?._id || userDetails?.id;
    const payload = {
      roomId: roomId ? roomId.trim().toUpperCase() : undefined,
      roomCode: roomId ? roomId.trim().toUpperCase() : undefined,
      userId: uId?.toString(),
      challengerUserId: challengerUserId?.toString(),
      opponent: userDetails,
      userDetails,
      joinedPlayer: userDetails,
      isReady: true,
    };
    if (bSock) {
      bSock.emit("battle:accept_challenge", payload, callback);
      bSock.emit("accept_challenge", payload, callback);
      bSock.emit("battle:player_joined", payload);
      bSock.emit("player_joined", payload);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:accept_challenge", payload, callback);
      rSock.emit("accept_challenge", payload, callback);
      rSock.emit("battle:player_joined", payload);
      rSock.emit("player_joined", payload);
    }
  }

  /**
   * Opponent rejects / declines a 1v1 challenge (battle:reject_challenge)
   */
  rejectChallengeViaSocket({ roomId, challengerUserId }) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const payload = {
      roomId: roomId ? roomId.trim().toUpperCase() : undefined,
      challengerUserId: challengerUserId?.toString(),
    };
    if (bSock) {
      bSock.emit("battle:reject_challenge", payload);
      bSock.emit("reject_challenge", payload);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:reject_challenge", payload);
      rSock.emit("reject_challenge", payload);
    }
  }

  /**
   * 3. Roll Dice (battle:roll_dice & broadcast)
   */
  rollBattleDiceViaSocket({ roomId, userId, playerIndex, diceValue }) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const payload = {
      roomId: roomId ? roomId.trim().toUpperCase() : undefined,
      userId: userId?.toString(),
      playerIndex: Number(playerIndex ?? 0),
      diceValue: Number(diceValue || 6),
    };
    if (bSock) {
      bSock.emit("battle:roll_dice", payload);
      bSock.emit("battle:dice_rolled", payload);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:roll_dice", payload);
      rSock.emit("battle:dice_rolled", payload);
    }
  }

  /**
   * Move Pawn (battle:move_pawn & broadcast)
   */
  moveBattlePawnViaSocket({
    roomId,
    userId,
    playerIndex,
    pawnIndex,
    diceValue,
  }) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const payload = {
      roomId: roomId ? roomId.trim().toUpperCase() : undefined,
      userId: userId?.toString(),
      playerIndex: Number(playerIndex ?? 0),
      pawnIndex: Number(pawnIndex),
      diceValue: Number(diceValue || 6),
      steps: Number(diceValue || 6),
    };
    if (bSock) {
      bSock.emit("battle:move_pawn", payload);
      bSock.emit("battle:pawn_moved", payload);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:move_pawn", payload);
      rSock.emit("battle:pawn_moved", payload);
    }
  }

  /**
   * Advance Turn (battle:turn_changed & broadcast)
   */
  advanceTurnViaSocket({ roomId, currentTurnIndex, isExtraTurn = false }) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const payload = {
      roomId: roomId ? roomId.trim().toUpperCase() : undefined,
      currentTurnIndex: Number(currentTurnIndex),
      isExtraTurn: Boolean(isExtraTurn),
    };
    if (bSock) {
      bSock.emit("battle:turn_changed", payload);
    }
    if (rSock && rSock !== bSock) {
      rSock.emit("battle:turn_changed", payload);
    }
  }

  /**
   * 4. Emojis, Chat, Forfeit & State Sync
   */
  sendBattleEmojiViaSocket({ roomId, userId, emoji, name }) {
    const sock = this.getBattleSocket();
    if (sock && roomId) {
      sock.emit("battle:send_emoji", {
        roomId: roomId.trim().toUpperCase(),
        userId: userId?.toString(),
        emoji,
        name,
      });
    }
  }

  sendBattleChatViaSocket({ roomId, userId, message, name }) {
    const sock = this.getBattleSocket();
    if (sock && roomId) {
      sock.emit("battle:send_chat", {
        roomId: roomId.trim().toUpperCase(),
        userId: userId?.toString(),
        message,
        name,
      });
    }
  }

  forfeitBattleViaSocket({ roomId, userId }, callback) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const rId = roomId ? roomId.trim().toUpperCase() : "";
    const uId = userId ? userId.toString() : "";
    const payload = {
      roomId: rId,
      userId: uId,
    };
    if (bSock && rId) {
      bSock.emit("battle:leave_room", payload, (res) => {
        if (callback) callback(res);
      });
      bSock.emit("battle:forfeit", payload);
      bSock.emit("leave_room", payload);
    }
    if (rSock && rSock !== bSock && rId) {
      rSock.emit("battle:leave_room", payload, (res) => {
        if (callback) callback(res);
      });
      rSock.emit("battle:forfeit", payload);
      rSock.emit("leave_room", payload);
    }
  }

  leaveBattleRoomViaSocket({ roomId, userId }, callback) {
    const bSock = this.getBattleSocket();
    const rSock = this.getSocket();
    const rId = roomId ? roomId.trim().toUpperCase() : "";
    const uId = userId ? userId.toString() : "";
    const payload = {
      roomId: rId,
      userId: uId,
    };
    if (bSock && rId) {
      bSock.emit("battle:leave_room", payload, (res) => {
        if (callback) callback(res);
      });
      bSock.emit("battle:forfeit", payload);
      bSock.emit("leave_room", payload);
    }
    if (rSock && rSock !== bSock && rId) {
      rSock.emit("battle:leave_room", payload, (res) => {
        if (callback) callback(res);
      });
      rSock.emit("battle:forfeit", payload);
      rSock.emit("leave_room", payload);
    }
  }

  syncBattleStateViaSocket({ roomId, userId }, callback) {
    const sock = this.getBattleSocket();
    if (sock && roomId) {
      sock.emit(
        "battle:sync_state",
        { roomId: roomId.trim().toUpperCase(), userId: userId?.toString() },
        callback
      );
    }
  }

  /**
   * Initial sync on load to fetch live backend data across all battle routes (called only once or on explicit force)
   */
  async syncWithBackend(force = false) {
    if (!force && this.hasSyncedOnce && Date.now() - this.lastSyncTime < 30000) {
      return;
    }
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await Promise.allSettled([
        this.fetchWalletFromBackend(force),
        this.fetchLiveAutoMatchFromBackend(force),
        this.fetchActiveRoomsFromBackend(force),
        this.fetchOnlinePlayersFromBackend(force),
        this.fetchLeaderboardFromBackend(force),
        this.fetchBattleHistoryFromBackend(force),
      ]);
      this.hasSyncedOnce = true;
      this.lastSyncTime = Date.now();
    } finally {
      this.isSyncing = false;
    }
  }
}

const battleService = new BattleService();
export default battleService;
