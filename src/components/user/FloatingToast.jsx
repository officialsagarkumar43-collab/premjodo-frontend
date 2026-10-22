"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function FloatingToast({ toast, message, type, title, onClose }) {
  const toastObj = toast || {
    message: message || "",
    type: type || "info",
    title: title || null,
  };

  useEffect(() => {
    if (!toastObj.message && !toastObj.text) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastObj, onClose]);

  if (!toastObj.message && !toastObj.text) return null;

  const isSuccess = toastObj.type === "success";
  const isError = toastObj.type === "error";

  return (
    <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div
        className={`flex items-center gap-3.5 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
          isSuccess
            ? "bg-zinc-950/95 text-white border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-emerald-500/20 dark:bg-white/95 dark:text-zinc-950 dark:border-emerald-500/30 dark:ring-emerald-500/20 dark:shadow-emerald-500/10"
            : isError
            ? "bg-zinc-950/95 text-white border-rose-500/40 ring-1 ring-rose-500/20 shadow-rose-500/20 dark:bg-white/95 dark:text-zinc-950 dark:border-rose-500/30 dark:ring-rose-500/20 dark:shadow-rose-500/10"
            : "bg-zinc-950/95 text-white border-zinc-800 shadow-black/30 dark:bg-white/95 dark:text-zinc-950 dark:border-zinc-200 dark:shadow-zinc-900/10"
        }`}
      >
        <div
          className={`p-2 rounded-xl flex-shrink-0 ${
            isSuccess
              ? "bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-600"
              : isError
              ? "bg-rose-500/20 text-rose-400 dark:bg-rose-500/15 dark:text-rose-600"
              : "bg-zinc-800 text-zinc-300 dark:bg-zinc-100 dark:text-zinc-700"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {toastObj.title && (
            <h5 className="text-xs font-bold text-white dark:text-zinc-900 mb-0.5">
              {toastObj.title}
            </h5>
          )}
          <p className="text-xs font-semibold text-zinc-200 dark:text-zinc-800 leading-relaxed">
            {toastObj.text || toastObj.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0 dark:text-zinc-500 dark:hover:text-zinc-900 dark:hover:bg-zinc-100"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default FloatingToast;
