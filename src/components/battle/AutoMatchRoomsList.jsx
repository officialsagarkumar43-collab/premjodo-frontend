"use client";

import React, { useState } from "react";
import {
  Users,
  Swords,
  Crown,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Clock,
} from "lucide-react";

export default function AutoMatchRoomsList({
  rooms = [],
  onJoinRoom,
  onCreateRoomClick,
  onQuickAutoMatch,
}) {
  const [filterPlayers, setFilterPlayers] = useState("all"); // "all" | "2" | "3" | "4"
  const [filterStake, setFilterStake] = useState("all"); // "all" | 10 | 20 | 50 | 100
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((room) => {
    if (filterPlayers !== "all" && room.playerCount !== parseInt(filterPlayers)) {
      return false;
    }
    if (filterStake !== "all" && room.stake !== parseInt(filterStake)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHost = room.hostName.toLowerCase().includes(q);
      const matchCode = room.roomCode.toLowerCase().includes(q);
      const matchCity = room.hostCity?.toLowerCase().includes(q);
      return matchHost || matchCode || matchCity;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Auto-Match Bar */}
      <div className="p-[15px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{rooms.length} Active Public Waiting Rooms</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
            <span>Live AutoMatch Lobby</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
              Instant Connect
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg font-normal">
            Join any live room created by online players or create your own custom battle room!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onCreateRoomClick}
            className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Room</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: "all", label: "All Rooms" },
            { id: "4", label: "👑 4 Players" },
            { id: "3", label: "⚡ 3 Players" },
            { id: "2", label: "👥 2 Players (1v1)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPlayers(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterPlayers === tab.id
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search by Room Code or Host */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search host or code (e.g. LUDO-4)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>
      </div>

      {/* Grid of AutoMatch Waiting Rooms */}
      {filteredRooms.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No active rooms match this filter
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto font-normal">
            Create your own room to be the first host and invite players!
          </p>
          <button
            type="button"
            onClick={onCreateRoomClick}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white font-medium text-xs shadow-md hover:bg-rose-600 cursor-pointer"
          >
            Create {filterPlayers !== "all" ? `${filterPlayers}-Player` : ""} Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map((room) => {
            const slotsLeft = Math.max(1, room.playerCount - (room.currentSlots || 1));
            const isFilled = room.currentSlots >= room.playerCount;

            return (
              <div
                key={room.id}
                className="p-[15px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs dark:shadow-xl hover:border-rose-400/60 dark:hover:border-purple-500/60 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top Host info & Room code */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={room.hostAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                        alt={room.hostName || "Host"}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
                        }}
                      />
                      {room.isUserCreated && (
                        <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow">
                          YOU
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {room.hostName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium border border-rose-200/60 dark:border-rose-500/20">
                          HOST
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
                        {room.hostCity || "Online"} • Created {room.createdAt || "Just now"}
                      </div>
                    </div>
                  </div>

                  {/* Room Code Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-medium">Room Code</span>
                    <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
                      {room.roomCode}
                    </span>
                  </div>
                </div>

                {/* Slots & Prize Pool details */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                  {/* Slots visual */}
                  <div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-medium mb-1">
                      {room.playerCount} Players ({room.currentSlots || 1}/{room.playerCount} Joined)
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: room.playerCount }).map((_, sIdx) => {
                        const filled = sIdx < (room.currentSlots || 1);
                        const colors = ["bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"];
                        return (
                          <div
                            key={sIdx}
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                              filled
                                ? colors[sIdx % colors.length]
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-600"
                            }`}
                          >
                            {filled ? "✓" : sIdx + 1}
                          </div>
                        );
                      })}
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1.5">
                        {slotsLeft} {slotsLeft === 1 ? "Slot" : "Slots"} Left!
                      </span>
                    </div>
                  </div>

                  {/* Stake & Prize Pool */}
                  <div className="text-right border-l border-zinc-200 dark:border-zinc-700 pl-3">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-normal">Stake: ₹{room.stake}</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Win ₹{room.prize}
                    </span>
                  </div>
                </div>

                {/* Join & Battle Button */}
                <button
                  type="button"
                  onClick={() => onJoinRoom(room)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>Join Room & Auto-Match ⚔️</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
