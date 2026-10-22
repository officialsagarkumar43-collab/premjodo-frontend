"use client";

import React from "react";
import { Sparkles } from "lucide-react";

// Dot positions for 1-6 standard die
const DICE_DOTS = {
  1: [{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }],
  2: [
    { top: "22%", left: "22%" },
    { bottom: "22%", right: "22%" },
  ],
  3: [
    { top: "22%", left: "22%" },
    { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    { bottom: "22%", right: "22%" },
  ],
  4: [
    { top: "22%", left: "22%" },
    { top: "22%", right: "22%" },
    { bottom: "22%", left: "22%" },
    { bottom: "22%", right: "22%" },
  ],
  5: [
    { top: "22%", left: "22%" },
    { top: "22%", right: "22%" },
    { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    { bottom: "22%", left: "22%" },
    { bottom: "22%", right: "22%" },
  ],
  6: [
    { top: "20%", left: "22%" },
    { top: "20%", right: "22%" },
    { top: "50%", left: "22%", transform: "translateY(-50%)" },
    { top: "50%", right: "22%", transform: "translateY(-50%)" },
    { bottom: "20%", left: "22%" },
    { bottom: "20%", right: "22%" },
  ],
};

export default function DiceRoller({
  value = 6,
  isRolling = false,
  canRoll = false,
  onRoll,
  playerColor = "red", // "red" | "green" | "yellow" | "blue"
  playerName = "You",
  isMyTurn = true,
  turnTimer = 15,
}) {
  const dots = DICE_DOTS[value] || DICE_DOTS[6];

  // Classic Ludo King dot color
  const dotColor =
    playerColor === "red"
      ? "bg-red-600 shadow-inner"
      : playerColor === "green"
      ? "bg-emerald-600 shadow-inner"
      : playerColor === "yellow"
      ? "bg-amber-600 shadow-inner"
      : "bg-blue-600 shadow-inner";

  return (
    <div className="flex flex-col items-center select-none">
      {/* Ludo King Classic Wooden / Golden Beveled Dice Box */}
      <div className="relative p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-amber-700 via-yellow-900 to-amber-950 border-2 border-amber-400 shadow-2xl">
        {/* Inner Felt Cushion */}
        <div
          className={`relative p-2 rounded-xl transition-all duration-300 ${
            playerColor === "red"
              ? "bg-gradient-to-b from-red-950 to-red-900 border border-red-700/60"
              : "bg-gradient-to-b from-emerald-950 to-emerald-900 border border-emerald-700/60"
          } ${
            canRoll && !isRolling
              ? "ring-4 ring-yellow-400/80 shadow-lg shadow-yellow-500/40"
              : ""
          }`}
        >
          {/* 3D Realistic Ivory Cube Die */}
          <button
            type="button"
            disabled={!canRoll || isRolling}
            onClick={onRoll}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white via-zinc-100 to-zinc-200 border-2 border-white shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
              canRoll && !isRolling
                ? "scale-105 animate-bounce hover:scale-110 active:scale-95"
                : ""
            } ${isRolling ? "animate-spin" : ""}`}
            style={{
              boxShadow:
                "0 8px 16px -2px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.25)",
            }}
          >
            {/* Dots */}
            <div className="relative w-full h-full p-2">
              {dots.map((pos, idx) => (
                <div
                  key={idx}
                  className={`absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${dotColor}`}
                  style={pos}
                />
              ))}
            </div>

            {/* 6 Celebration Badge */}
            {value === 6 && !isRolling && (
              <div className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-yellow-100 flex items-center gap-0.5 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                6!
              </div>
            )}
          </button>
        </div>

        {/* TAP TO ROLL Ribbon */}
        {canRoll && !isRolling && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black font-black text-[9px] uppercase tracking-wider shadow-md border border-yellow-100 animate-pulse">
            TAP TO ROLL 🎲
          </div>
        )}
      </div>
    </div>
  );
}
