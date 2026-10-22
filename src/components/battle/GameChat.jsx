"use client";

import React, { useState } from "react";
import { MessageSquare, Smile, X, Send } from "lucide-react";

const QUICK_EMOJIS = ["❤️", "🔥", "😎", "😂", "😢", "🎉", "😱", "🤞"];
const QUICK_PHRASES = [
  "Good luck! 🍀",
  "Nice move! 🔥",
  "Oops! 😅",
  "Play fast please! ⏳",
  "Well played ❤️",
  "Rematch after this? ⚔️",
  "Game on! 🏆",
];

export default function GameChat({ onSendMessage, activeReactions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (text) => {
    if (onSendMessage) {
      onSendMessage(text);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-700 dark:text-zinc-200 hover:text-rose-500 hover:border-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"
      >
        <Smile className="w-4 h-4 text-amber-500" />
        <span>Taunts / Emojis</span>
      </button>

      {/* Floating Reactions overlay */}
      <div className="fixed bottom-24 right-6 pointer-events-none z-40 flex flex-col gap-2 items-end">
        {activeReactions.map((r) => (
          <div
            key={r.id}
            className="px-3 py-1.5 rounded-2xl bg-zinc-900/90 backdrop-blur-md text-white border border-rose-500/40 text-sm font-bold shadow-xl animate-in slide-in-from-bottom duration-300 flex items-center gap-1.5"
          >
            <span className="text-rose-400 font-semibold text-xs">{r.sender}:</span>
            <span>{r.text}</span>
          </div>
        ))}
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Quick In-Game Reactions
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emojis Grid */}
          <div className="grid grid-cols-4 gap-1.5 my-2.5">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="text-xl p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-transform active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick Messages */}
          <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => handleSelect(phrase)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
