"use client";

import React from "react";
import { X, Sparkles, ShieldCheck, Heart, MapPin, Smile, BookOpen, SlidersHorizontal, User } from "lucide-react";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

export function ProfilePreviewModal({ isOpen, onClose, profile = {}, user = {} }) {
  if (!isOpen) return null;

  const safeProfile = profile || {};
  const safeUser = user || {};

  const displayName =
    safeUser?.fullName ||
    safeProfile?.fullName ||
    (safeUser?.email ? safeUser.email.split("@")[0] : "User");

  const birthYear = safeProfile?.birthday?.year || safeProfile?.birthYear || 2000;
  const currentYear = new Date().getFullYear();
  const calculatedAge = Math.max(18, currentYear - (parseInt(birthYear, 10) || 2000));

  const photo =
    (Array.isArray(safeProfile?.photos) && safeProfile.photos.find((p) => p?.isPrimary)?.url) ||
    (Array.isArray(safeProfile?.photos) && safeProfile.photos[0]?.url) ||
    safeProfile?.photo ||
    safeUser?.avatar ||
    "";
  const resolvedPhoto = resolveImageUrl(photo, "");

  const bio = safeProfile?.bio || safeProfile?.aboutMe || "Passionate about meaningful connections, fun conversations, and mutual growth.";
  const interests = safeProfile?.interests || [];
  const intent = safeProfile?.relationshipIntent || safeProfile?.lookingFor || "long_term_partner";

  const intentLabels = {
    long_term_partner: "💘 Long-term partner",
    long_term_open_to_short: "😍 Long-term, open to short",
    short_term_open_to_long: "🥂 Short-term, open to long",
    short_term_fun: "🎉 Short-term fun",
    new_friends: "👋 New friends",
    still_figuring_it_out: "🤔 Figuring it out",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Public Discovery Card
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Card Preview */}
          <div className="w-full aspect-[3/4.2] rounded-2xl overflow-hidden relative shadow-md bg-zinc-900 flex flex-col justify-end">
            {resolvedPhoto ? (
              <img
                src={resolvedPhoto}
                alt={displayName}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                <Sparkles className="w-10 h-10 text-rose-400 mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-zinc-300">No primary photo set</p>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 p-5 space-y-2 text-white">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black">{displayName}</h2>
                <span className="text-xl font-normal text-white/90">{calculatedAge}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/20 backdrop-blur-md">
                <span>{intentLabels[intent] || "Seeking connection"}</span>
              </div>
              <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                {bio}
              </p>
            </div>
          </div>

          {/* Secondary Details */}
          <div className="space-y-3 text-xs">
            {safeProfile.education && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <BookOpen className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Education: <strong>{safeProfile.education}</strong></span>
              </div>
            )}
            {safeProfile.religion && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Religion / Belief: <strong>{safeProfile.religion}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
