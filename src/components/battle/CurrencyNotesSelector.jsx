"use client";

import React from "react";
import { Coins, Crown, Sparkles, Flame, Zap, ShieldCheck } from "lucide-react";

export const CURRENCY_NOTES = [
  {
    denomination: 10,
    entryFee: 10,
    prize: 18,
    badge: "Beginner Note",
    colorName: "Chocolate Brown",
    bgGradient: "from-[#4a2610] via-[#6d3715] to-[#381c0b]",
    borderGradient: "border-[#9c5324]",
    accentColor: "#f59e0b",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    serial: "PJ 10 92841",
    popular: false,
  },
  {
    denomination: 20,
    entryFee: 20,
    prize: 36,
    badge: "Quick Note",
    colorName: "Greenish Olive",
    bgGradient: "from-[#2f4207] via-[#4d6b0e] to-[#223105]",
    borderGradient: "border-[#7fa61c]",
    accentColor: "#a3e635",
    tagColor: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    serial: "PJ 20 54109",
    popular: false,
  },
  {
    denomination: 30,
    entryFee: 30,
    prize: 54,
    badge: "Active Note",
    colorName: "Mint Turquoise",
    bgGradient: "from-[#06423c] via-[#0b635b] to-[#042d29]",
    borderGradient: "border-[#14998c]",
    accentColor: "#2dd4bf",
    tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    serial: "PJ 30 71832",
    popular: false,
  },
  {
    denomination: 40,
    entryFee: 40,
    prize: 72,
    badge: "Royal Note",
    colorName: "Sapphire Indigo",
    bgGradient: "from-[#112354] via-[#1b3680] to-[#0b1738]",
    borderGradient: "border-[#2b59cf]",
    accentColor: "#60a5fa",
    tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    serial: "PJ 40 39201",
    popular: false,
  },
  {
    denomination: 50,
    entryFee: 50,
    prize: 90,
    badge: "Most Popular",
    colorName: "Hampi Cyan",
    bgGradient: "from-[#004652] via-[#006e80] to-[#00313a]",
    borderGradient: "border-[#00bcd4]",
    accentColor: "#22d3ee",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    serial: "PJ 50 88392",
    popular: true,
  },
  {
    denomination: 100,
    entryFee: 100,
    prize: 180,
    badge: "Grand Master",
    colorName: "Lavender Purple",
    bgGradient: "from-[#350d5e] via-[#51168f] to-[#250742]",
    borderGradient: "border-[#9c27b0]",
    accentColor: "#e879f9",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    serial: "PJ 100 99402",
    popular: false,
  },
];

export default function CurrencyNotesSelector({
  selectedStake,
  onSelectStake,
}) {
  return (
    <div className="w-full space-y-3">
      {/* Header bar: 1v1 Mode tag & Stake overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode: 1 vs 1 Battle (Single Opponent)</span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden md:inline">
            Select Rupee Note denomination to challenge online players
          </span>
        </div>

        <div className="text-xs text-zinc-300 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-zinc-400">Selected Stake:</span>
          <span className="font-mono font-black text-amber-400 text-sm">
            ₹{selectedStake?.entryFee || 50}
          </span>
          <span className="text-emerald-400 font-bold">
            (Prize: ₹{selectedStake?.prize || 90})
          </span>
        </div>
      </div>

      {/* Grid of Indian Currency Notes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CURRENCY_NOTES.map((note) => {
          const isSelected = selectedStake?.entryFee === note.entryFee;
          return (
            <button
              key={note.denomination}
              type="button"
              onClick={() => onSelectStake(note)}
              className={`relative group rounded-2xl p-3 bg-gradient-to-br ${note.bgGradient} border-2 ${isSelected
                  ? "border-yellow-400 ring-4 ring-yellow-400/30 shadow-xl shadow-yellow-500/20 scale-[1.03] z-10"
                  : `${note.borderGradient} hover:scale-[1.02] opacity-90 hover:opacity-100`
                } text-left transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px]`}
            >
              {/* Note Guilloche Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />

              {/* Watermark circle */}
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border border-white/10 opacity-20 pointer-events-none flex items-center justify-center font-black text-3xl text-white">
                ₹
              </div>

              {/* Top Row: Tag & Serial */}
              <div className="flex items-center justify-between z-10">
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${note.tagColor}`}
                >
                  {note.popular ? "🔥 Most Popular" : `₹${note.denomination} Note`}
                </span>
                <span className="text-[8px] font-mono text-zinc-300/70 tracking-widest">
                  {note.serial}
                </span>
              </div>

              {/* Center: Currency Denomination & Symbol */}
              <div className="my-2 z-10">
                <div className="text-[10px] uppercase tracking-widest text-zinc-300 font-semibold flex items-center gap-1">
                  <span>PREM JODO ARENA</span>
                </div>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                    ₹{note.denomination}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-300">STAKE</span>
                </div>
              </div>

              {/* Bottom Row: Prize & Selection Ribbon */}
              <div className="pt-1.5 border-t border-white/15 flex items-center justify-between z-10">
                <div>
                  <div className="text-[9px] text-zinc-300 font-medium leading-none">
                    WIN PRIZE
                  </div>
                  <div className="text-xs font-black text-emerald-300 leading-tight">
                    ₹{note.prize}
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected
                      ? "bg-yellow-400 text-black font-black text-xs shadow-md"
                      : "bg-white/10 text-zinc-300 group-hover:bg-white/20 text-[10px]"
                    }`}
                >
                  {isSelected ? "✓" : "+"}
                </div>
              </div>

              {/* Selection Glow Indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
