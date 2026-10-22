"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Briefcase,
  BookOpen,
  MapPin,
  Smile,
  Eye,
} from "lucide-react";
import { resolveImageUrl, extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import authService from "@/lib/services/auth.service";

export function LiveProfileCardPreview({
  profile: propProfile = {},
  user: propUser = {},
  liveData = {},
}) {
  const [syncedProfile, setSyncedProfile] = useState(() => authService.getProfile() || propProfile || {});
  const [syncedUser, setSyncedUser] = useState(() => authService.getUser() || propUser || {});

  useEffect(() => {
    const handleAuthChange = () => {
      const p = authService.getProfile();
      const u = authService.getUser();
      if (p) setSyncedProfile(p);
      if (u) setSyncedUser(u);
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);
    return () => window.removeEventListener("pj-auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    if (propProfile && Object.keys(propProfile).length > 0) {
      setSyncedProfile(propProfile);
    }
  }, [propProfile]);

  useEffect(() => {
    if (propUser && Object.keys(propUser).length > 0) {
      setSyncedUser(propUser);
    }
  }, [propUser]);

  const safeProfile = syncedProfile || propProfile || authService.getProfile() || {};
  const safeUser = syncedUser || propUser || authService.getUser() || {};
  const safeLiveData = liveData || {};

  const mergedName =
    safeLiveData.firstName ||
    safeUser.fullName ||
    safeProfile.fullName ||
    safeUser.name ||
    safeProfile.name ||
    (safeUser.email ? safeUser.email.split("@")[0] : "Your Name");

  const hasVipBadge = Boolean(
    safeUser?.vipBadge ||
    safeProfile?.vipBadge ||
    safeUser?.isVip ||
    safeProfile?.isVip ||
    safeUser?.isVIP ||
    safeProfile?.isVIP ||
    safeLiveData?.vipBadge ||
    safeProfile?.membership?.vipBadge ||
    safeUser?.membership?.vipBadge
  );

  const birthYear =
    safeLiveData.birthYear ||
    safeProfile.birthday?.year ||
    safeProfile.birthYear ||
    2000;
  const currentYear = new Date().getFullYear();
  const calculatedAge = Math.max(18, currentYear - (parseInt(birthYear, 10) || 2000));

  // Multi-tier photo resolution
  let livePhoto = "";
  if (safeLiveData.profilePhoto) {
    livePhoto = safeLiveData.profilePhoto;
  } else if (Array.isArray(safeLiveData.photoSlots) && safeLiveData.photoSlots.length > 0) {
    const primarySlot = safeLiveData.photoSlots.find((s) => s?.isPrimary && s?.url) || safeLiveData.photoSlots.find((s) => s?.url);
    if (primarySlot) {
      livePhoto = primarySlot.url || primarySlot.rawUrl || "";
    }
  }

  const resolvedPhoto =
    resolveImageUrl(livePhoto, "") ||
    extractPrimaryPhoto(safeProfile) ||
    extractPrimaryPhoto(safeUser) ||
    extractPrimaryPhoto(authService.getProfile()) ||
    extractPrimaryPhoto(authService.getUser()) ||
    "";

  const bio =
    safeLiveData.aboutMe !== undefined
      ? safeLiveData.aboutMe
      : safeProfile.bio ||
        safeProfile.aboutMe ||
        "Passionate about meaningful connections, good conversations, and exploring new experiences.";

  const intent =
    safeLiveData.relationshipIntent ||
    safeProfile.relationshipIntent ||
    safeProfile.lookingFor ||
    "long_term_partner";

  const intentLabels = {
    long_term_partner: "💘 Long-term partner",
    long_term_open_to_short: "😍 Long-term, open to short",
    short_term_open_to_long: "🥂 Short-term, open to long",
    short_term_fun: "🎉 Short-term fun",
    new_friends: "👋 New friends",
    still_figuring_it_out: "🤔 Figuring it out",
  };

  const interestsList =
    safeLiveData.interests ||
    safeProfile.interests ||
    ["Music", "Coffee", "Travel", "Fitness"];

  const religion = safeLiveData.religion || safeProfile.religion || "";
  const education = safeLiveData.education || safeProfile.education || "";

  return (
    <div className="w-full hidden lg:flex flex-col items-center select-none sticky top-24">
      {/* Label Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <Eye className="w-4 h-4 text-rose-500" />
          <span>Live Card Preview</span>
        </div>
        <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-900/50">
          Public View
        </span>
      </div>

      {/* Card Preview Container */}
      <div className="w-full max-w-sm aspect-[3/4.6] rounded-3xl overflow-hidden relative shadow-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-900 flex flex-col justify-end">
        {/* Background Image / Placeholder */}
        {resolvedPhoto ? (
          <img
            src={resolvedPhoto}
            alt={mergedName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/60 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              No Photo Uploaded Yet
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Add photos in the Photos section to see your card shine
            </p>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Prem Jodo Single</span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasVipBadge && (
              <div className="px-2 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black flex items-center gap-1 shadow-md">
                👑 VIP
              </div>
            )}
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/90 text-white flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom User Info Overlay */}
        <div className="relative z-10 p-5 space-y-3 text-white">
          {/* Name & Age */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight drop-shadow-md truncate">
                {mergedName}
              </h2>
              <span className="text-xl font-medium text-white/90 drop-shadow-md">
                {calculatedAge}
              </span>
              {hasVipBadge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-md ml-1">
                  👑 VIP
                </span>
              )}
            </div>

            {/* Intent Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/15 backdrop-blur-md text-white border border-white/20">
              <span>{intentLabels[intent] || "Looking for meaningful connection"}</span>
            </div>
          </div>

          {/* Bio Preview */}
          {bio && (
            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed drop-shadow-xs font-normal">
              {bio}
            </p>
          )}

          {/* Education / Religion Pill */}
          {(education || religion) && (
            <div className="flex flex-wrap gap-1.5 text-[11px] text-white/90">
              {education && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs border border-white/15">
                  🎓 {education}
                </span>
              )}
              {religion && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs border border-white/15">
                  🕊️ {religion}
                </span>
              )}
            </div>
          )}

          {/* Interests Pills */}
          {interestsList && interestsList.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {interestsList.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/30 text-rose-200 border border-rose-400/30 backdrop-blur-xs"
                >
                  {typeof tag === "object" ? tag.name : tag}
                </span>
              ))}
              {interestsList.length > 4 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/70">
                  +{interestsList.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveProfileCardPreview;
