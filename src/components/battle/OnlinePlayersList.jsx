"use client";

import React, { useState } from "react";
import {
  Users,
  Swords,
  ShieldCheck,
  Sparkles,
  Trophy,
  Flame,
  Search,
  Heart,
  MapPin,
  CheckCircle2,
  Crown,
} from "lucide-react";

export default function OnlinePlayersList({
  players = [],
  selectedStake,
  onChallengePlayer,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "matches" | "top"

  const filteredPlayers = players.filter((player) => {
    const playerName = (player.name || player.fullName || "").toLowerCase();
    const playerCity = (player.city || player.location || "").toLowerCase();
    const playerBadge = (player.badge || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      playerName.includes(query) ||
      playerCity.includes(query) ||
      playerBadge.includes(query);

    if (!matchesSearch) return false;
    if (filterTab === "matches") return Boolean(player.isMatch);
    if (filterTab === "top") return parseInt(player.winRate || 0) >= 75;
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin text-amber-500" />
            ) : (
              <Users className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <div>
            <h3 className="poppins-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Live Online Players</span>
              {isLoading ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Connecting...
                </span>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    ({players.length} Active Now)
                  </span>
                </>
              )}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isLoading
                ? "Connecting to live battle server & searching for online battlers..."
                : "Pick any active player to generate a 1v1 Battle Room Code & challenge them!"}
            </p>
          </div>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              disabled={isLoading}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {[
              { id: "all", label: "All" },
              { id: "matches", label: "❤️ Matches" },
              { id: "top", label: "🏆 Top 75%+" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                } disabled:opacity-50`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Theme Spinner */}
      {isLoading || filteredPlayers.length === 0 ? (
        <div className="py-20 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-10 h-10 rounded-full border-3 border-rose-500/20 border-t-rose-500 border-r-amber-400 animate-spin mb-3" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
            {searchQuery ? "Searching players..." : "Finding online players..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player, idx) => (
            <div
              key={player.id || player._id || player.userId || idx}
              className="group relative rounded-3xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-400/60 dark:hover:border-rose-500/50 shadow-xs dark:shadow-xl hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top Match Tag or Badge */}
              <div className="flex items-center justify-between mb-3">
                {player.isMatch ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    Prem Jodo Match
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    {player.badge || "1v1 Player"}
                  </span>
                )}

                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Player Avatar & Details */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      player.avatar ||
                      player.photo ||
                      `https://images.unsplash.com/photo-${1534528741775 + (idx * 37)}?w=300&auto=format&fit=crop&q=80`
                    }
                    alt={player.name || player.fullName || "Player"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://images.unsplash.com/photo-${1534528741775 + (idx * 37)}?w=300&auto=format&fit=crop&q=80`;
                    }}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-rose-500 transition-colors"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-xs" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="poppins-bold text-sm text-zinc-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                    {player.name || player.fullName || "Player"}, {player.age || 24}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span className="truncate">{player.city || player.location || "Nearby"}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span>{player.winRate || "70%"} Win Rate • {player.totalWins || player.matchesWon || 0} Wins</span>
                  </div>
                </div>
              </div>

              {/* Stake & Earnings Stats */}
              <div className="py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 mb-3 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Total Won:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{player.totalEarned || player.totalWon || "₹5,000"}</span>
              </div>

              {/* Play Now Button with Selected Stake */}
              <button
                type="button"
                onClick={() => onChallengePlayer(player)}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Play for ₹{selectedStake?.entryFee || 50}</span>
                <span className="text-[10px] font-semibold text-yellow-200">
                  (Win ₹{selectedStake?.prize || 90})
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
