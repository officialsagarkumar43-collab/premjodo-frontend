"use client";

import React from "react";
import { X, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageIcon } from "./LanguageIcon";

export function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[2rem] p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800/90 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600/20 to-pink-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <LanguageIcon code={language} size="lg" className="text-rose-500" />
            </div>
            <div>
              <h3 className="poppins-bold text-lg sm:text-xl text-zinc-900 dark:text-white tracking-tight">Select Language</h3>
              <p className="text-xs poppins-regular text-zinc-500 dark:text-zinc-400 mt-0.5">अपनी पसंदीदा भाषा चुनें / Choose your preferred language</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close language selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid - 3 Cards per row on desktop/tablets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                  ? "bg-rose-50 dark:bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/15 ring-1 ring-rose-500"
                  : "bg-zinc-50/80 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm font-bold transition-colors ${
                      isSelected
                        ? "bg-rose-500 text-white border-rose-500 shadow-xs shadow-rose-500/30"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80"
                    }`}
                  >
                    <LanguageIcon code={lang.code} symbol={lang.symbol} size="sm" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="poppins-bold text-sm sm:text-base leading-tight text-zinc-900 dark:text-white">{lang.name}</div>
                    <div className="text-[11px] poppins-medium text-zinc-500 dark:text-zinc-400">{lang.nativeName}</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-500/40">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline-flex items-center gap-1.5 poppins-medium">
            <span className="text-rose-500 font-bold">♥</span> Select your own preferred language
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm poppins-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
