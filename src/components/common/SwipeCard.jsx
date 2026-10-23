"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Heart,
  X,
  Star,
  MapPin,
  Briefcase,
  BadgeCheck,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Zap,
  Flame,
  Crown,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/utility/imageUrl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSwipeLimit } from "@/lib/hooks/useSwipeLimit";
import { SwipeLimitModal } from "@/components/common/SwipeLimitModal";

export function SwipeCard({ profiles = [], onSwipe, onReset, onRewind, onOpenFilters }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | 'up' | null

  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const router = useRouter();
  const { user, subscription } = useAuth();
  const [rewindWarning, setRewindWarning] = useState("");

  const isVip = Boolean(subscription?.status === "active" || subscription?.isVip || user?.role === "admin");
  const canRewindUnlimited = Boolean(subscription?.perks?.rewindAllowed || isVip);
  const nextNextProfile = profiles[currentIndex + 2];

  // Daily Swipe Limit live tracker hook
  const {
    swipesRemaining,
    dailyLimit,
    isUnlimited,
    isLimitReached,
    showLimitModal,
    setShowLimitModal,
    countdown,
    checkCanSwipe,
    limitErrorMessage,
    recordSwipeSuccess,
    recordRewindSuccess,
  } = useSwipeLimit();

  // Execute swipe animation smoothly then advance index
  const triggerSwipe = useCallback((direction) => {
    if (swipeDirection || currentIndex >= profiles.length) return;

    // Check if daily swipe limit has been reached
    if (!checkCanSwipe()) {
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    setSwipeDirection(direction);

    if (onSwipe && currentProfile) {
      const actionMap = {
        right: "like",
        left: "dislike",
        up: "superlike",
      };
      const action = actionMap[direction] || "like";
      onSwipe(currentProfile, action);
      recordSwipeSuccess();
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      isDraggingRef.current = false;
      setIsDragging(false);
    }, 280);
  }, [currentIndex, profiles.length, swipeDirection, currentProfile, onSwipe]);

  const handleRewind = () => {
    if (swipeDirection) return;

    if (currentIndex <= 0) {
      setRewindWarning(
        canRewindUnlimited
          ? "No swipes to rewind yet! Swipe a profile first to undo it anytime (Unlimited Rewinds Active ✨)"
          : "Swipe a card first to undo your last pass!"
      );
      setTimeout(() => setRewindWarning(""), 3500);
      return;
    }

    if (!canRewindUnlimited) {
      const todayKey = `pj_rewind_used_${new Date().toISOString().slice(0, 10)}`;
      const usedToday = typeof window !== "undefined" && localStorage.getItem(todayKey);
      if (usedToday) {
        setRewindWarning("You used your 1 free daily rewind! Upgrade to VIP for Unlimited Rewinds.");
        setTimeout(() => setRewindWarning(""), 3500);
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(todayKey, "1");
      }
    }

    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    if (onRewind && profiles[prevIndex]) {
      onRewind(profiles[prevIndex]);
      recordRewindSuccess();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    isDraggingRef.current = false;
    setIsDragging(false);
    if (onReset) onReset();
  };

  // Drag Event Handlers with window tracking
  const handlePointerDown = (e) => {
    if (swipeDirection || !currentProfile) return;
    if (e.target.closest("button")) return;
    if (e.button !== undefined && e.button !== 0) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handlePointerUp = (upEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      const deltaX = upEvent.clientX - dragStartRef.current.x;
      const deltaY = upEvent.clientY - dragStartRef.current.y;

      const horizontalThreshold = 75;
      const verticalThreshold = -90;

      if (deltaX > horizontalThreshold) {
        if (!checkCanSwipe()) {
          setDragOffset({ x: 0, y: 0 });
          return;
        }
        triggerSwipe("right");
      } else if (deltaX < -horizontalThreshold) {
        if (!checkCanSwipe()) {
          setDragOffset({ x: 0, y: 0 });
          return;
        }
        triggerSwipe("left");
      } else if (deltaY < verticalThreshold && Math.abs(deltaX) < 60) {
        if (!checkCanSwipe()) {
          setDragOffset({ x: 0, y: 0 });
          return;
        }
        triggerSwipe("up");
      } else {
        // Snap back to center
        setDragOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  if (currentIndex >= profiles.length || !currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl w-full max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] h-full max-h-full mx-auto my-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-500">
            <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
        </div>
        <h3 className="text-xl poppins-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
          That&apos;s everyone for now!
        </h3>
        <p className="text-xs sm:text-sm poppins-regular text-zinc-500 dark:text-zinc-400 max-w-xs mb-6 leading-relaxed">
          You&apos;ve viewed all available profiles nearby. Check back soon or reset to discover again.
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white poppins-semibold text-xs sm:text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Discovery Deck
        </button>
      </div>
    );
  }

  // Calculate transform values constrained nicely to frame
  let translateX = dragOffset.x;
  let translateY = dragOffset.y;
  let rotation = dragOffset.x * 0.06;
  let opacity = 1;
  let scale = 1;

  if (swipeDirection === "right") {
    translateX = 380;
    translateY = dragOffset.y + 20;
    rotation = 18;
    opacity = 0;
    scale = 0.95;
  } else if (swipeDirection === "left") {
    translateX = -380;
    translateY = dragOffset.y + 20;
    rotation = -18;
    opacity = 0;
    scale = 0.95;
  } else if (swipeDirection === "up") {
    translateY = -400;
    rotation = 0;
    opacity = 0;
    scale = 0.92;
  }

  // Stamp badge opacities
  const likeOpacity =
    swipeDirection === "right"
      ? 1
      : Math.min(1, Math.max(0, dragOffset.x / 60));

  const nopeOpacity =
    swipeDirection === "left"
      ? 1
      : Math.min(1, Math.max(0, -dragOffset.x / 60));

  const superLikeOpacity =
    swipeDirection === "up"
      ? 1
      : Math.min(1, Math.max(0, -dragOffset.y / 70));

  // Stack scale calculation for the 2nd card
  const dragDistance = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);
  const dragProgress = Math.min(1, dragDistance / 120);
  const nextCardScale = 0.94 + dragProgress * 0.06;
  const nextCardTranslateY = 12 - dragProgress * 12;

  const activePhoto = resolveImageUrl(
    currentProfile.photos?.[0] || currentProfile.photo || currentProfile.avatar || ""
  );

  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] h-full max-h-full mx-auto select-none touch-none overflow-hidden rounded-3xl p-0.5 sm:p-1">
      {/* 3rd Deck Card (Deepest Stack Layer) */}
      {nextNextProfile && (
        <div
          className="absolute inset-0.5 sm:inset-1 rounded-3xl overflow-hidden bg-zinc-800 border border-zinc-700/50 shadow-md pointer-events-none transition-all duration-300"
          style={{
            transform: "scale(0.88) translateY(24px)",
            opacity: 0.45,
            zIndex: 10,
          }}
        >
          <img
            src={resolveImageUrl(nextNextProfile.photos?.[0] || nextNextProfile.photo || nextNextProfile.avatar)}
            alt={nextNextProfile.name}
            className="w-full h-full object-cover filter brightness-75 pointer-events-none"
            draggable={false}
          />
        </div>
      )}

      {/* 2nd Deck Card (Underneath Active Card) */}
      {nextProfile && (
        <div
          className="absolute inset-0.5 sm:inset-1 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-xl pointer-events-none transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${nextCardScale}) translateY(${nextCardTranslateY}px)`,
            opacity: 0.85 + dragProgress * 0.15,
            zIndex: 20,
          }}
        >
          <img
            src={resolveImageUrl(nextProfile.photos?.[0] || nextProfile.photo || nextProfile.avatar)}
            alt={nextProfile.name}
            className="w-full h-full object-cover filter brightness-90 pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          <div className="absolute bottom-6 left-6 text-white opacity-85">
            <h3 className="text-xl poppins-bold">
              {nextProfile.name}, {nextProfile.age}
            </h3>
            <p className="text-xs text-zinc-300">{nextProfile.occupation}</p>
          </div>
        </div>
      )}

      {/* Top Active Interactive Swipe Card */}
      <div
        onPointerDown={handlePointerDown}
        className={`absolute inset-0.5 sm:inset-1 rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800/80 cursor-grab active:cursor-grabbing select-none ${
          isDragging
            ? "transition-none"
            : "transition-all duration-250 cubic-bezier(0.25, 1, 0.5, 1)"
        }`}
        style={{
          transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg) scale(${scale})`,
          opacity: opacity,
          zIndex: 30,
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Profile Image */}
        <img
          src={activePhoto}
          alt={currentProfile.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-45% to-transparent pointer-events-none" />

        {/* Top Badges: Distance & Filter Sliders Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs poppins-medium z-20">
          {/* Distance Pill & Origin Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 poppins-semibold shadow-md flex items-center gap-1.5 text-white text-xs">
              <span className="text-rose-500">📍</span>
              <span>{currentProfile.distanceKm || 4} km away</span>
            </span>

            {/* SUPER LIKE BADGE */}
            {Boolean(currentProfile.isSuperLike || currentProfile.hasSuperLiked) && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs poppins-bold shadow-lg flex items-center gap-1 border border-sky-300/50 animate-pulse">
                <Star className="w-3.5 h-3.5 fill-white stroke-white" />
                <span>Super Liked You</span>
              </span>
            )}

            {/* LIKED YOU BADGE */}
            {Boolean(currentProfile.isWhoLikedYou && !currentProfile.isSuperLike) && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs poppins-bold shadow-lg flex items-center gap-1 border border-rose-300/50 animate-pulse">
                <Heart className="w-3.5 h-3.5 fill-white stroke-white" />
                <span>Liked You</span>
              </span>
            )}

            {/* BOOST BADGE */}
            {Boolean(currentProfile.isBoosted || currentProfile.boostMode) && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs poppins-bold shadow-lg flex items-center gap-1 border border-amber-300/50 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-white stroke-white" />
                <span>Boosted</span>
              </span>
            )}
          </div>

          {/* Filter / Sliders Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenFilters) onOpenFilters();
            }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer pointer-events-auto"
            title="Discovery Filters"
          >
            <SlidersHorizontal className="w-4.5 h-4.5 text-white" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* DYNAMIC SWIPE STAMP BADGES */}
        {/* ============================================================ */}
        {/* Rewind upgrade / info banner */}
        {rewindWarning && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-amber-500/95 text-white text-xs poppins-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-2">
            <span>{rewindWarning}</span>
            {!canRewindUnlimited && (
              <button
                onClick={() => router.push("/user/subscriptions?tab=plans")}
                className="bg-white text-amber-700 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-xs hover:bg-amber-50 shrink-0 cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* 1. LIKE Stamp (Swiping Right) */}
        <div
          className="absolute top-16 left-5 border-4 border-emerald-400 bg-emerald-500/30 backdrop-blur-md text-emerald-400 font-black text-2xl px-3.5 py-1 rounded-2xl -rotate-12 uppercase tracking-widest pointer-events-none shadow-2xl flex items-center gap-2 transition-opacity duration-75 z-40"
          style={{ opacity: likeOpacity }}
        >
          <Heart className="w-6 h-6 fill-emerald-400 stroke-emerald-400" />
          LIKE
        </div>

        {/* 2. NOPE / PASS Stamp (Swiping Left) */}
        <div
          className="absolute top-16 right-5 border-4 border-rose-500 bg-rose-500/30 backdrop-blur-md text-rose-500 font-black text-2xl px-3.5 py-1 rounded-2xl rotate-12 uppercase tracking-widest pointer-events-none shadow-2xl flex items-center gap-2 transition-opacity duration-75 z-40"
          style={{ opacity: nopeOpacity }}
        >
          <X className="w-6 h-6 stroke-[3]" />
          NOPE
        </div>

        {/* 3. SUPER LIKE Stamp (Swiping Up) */}
        <div
          className="absolute bottom-28 inset-x-0 mx-auto w-max border-4 border-sky-400 bg-sky-500/35 backdrop-blur-md text-sky-400 font-black text-xl px-4 py-1.5 rounded-2xl uppercase tracking-widest pointer-events-none shadow-2xl flex items-center gap-2 transition-opacity duration-75 z-40"
          style={{ opacity: superLikeOpacity }}
        >
          <Star className="w-5 h-5 fill-sky-400 stroke-sky-400" />
          SUPER LIKE
        </div>

        {/* Card Content & Details */}
        <div className="absolute bottom-24 left-0 right-0 p-5 text-white pointer-events-none z-20">
          {/* Name, Age and Verified Badge */}
          <div className="flex items-center gap-2 mb-1 drop-shadow-md">
            <h2 className="text-2xl sm:text-3xl poppins-black tracking-tight flex items-center gap-1.5 text-white">
              <span>{currentProfile.name}, {currentProfile.age}</span>
            </h2>
            {Boolean(currentProfile.isVerified) && (
              <BadgeCheck className="w-6 h-6 text-sky-400 fill-sky-400 text-white flex-shrink-0 drop-shadow-sm" />
            )}
          </div>

          {/* Education / Occupation & Location */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 mb-2 poppins-medium drop-shadow-sm flex-wrap">
            <span className="flex items-center gap-1 text-zinc-200">
              💼 {currentProfile.education || currentProfile.occupation || "Graduate"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-zinc-200">
              📍 {currentProfile.location || currentProfile.city || "Nearby"}
            </span>
          </div>

          {/* Bio Line */}
          {currentProfile.bio && (
            <p className="text-xs sm:text-[13px] poppins-regular text-zinc-200 line-clamp-2 mb-3 leading-relaxed drop-shadow-sm">
              {currentProfile.bio}
            </p>
          )}

          {/* Interests Tags */}
          {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentProfile.interests.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] sm:text-xs poppins-medium px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-white shadow-xs capitalize"
                >
                  {String(tag).replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Controls (Matching Mobile Screenshot Circular Glowing Buttons) */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3.5 sm:gap-4 px-4 z-30 pointer-events-auto">
          {/* 1. Rewind Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRewind();
            }}
            disabled={!!swipeDirection}
            className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg cursor-pointer group ${
              currentIndex > 0
                ? "bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-400 hover:scale-105 active:scale-90 shadow-amber-500/20"
                : "bg-[#12131a]/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
            }`}
            title={
              currentIndex > 0
                ? "Rewind / Undo Last Swipe"
                : canRewindUnlimited
                ? "Unlimited Rewinds Active (Swipe a card first to undo)"
                : "Rewind (Swipe a card first)"
            }
          >
            <RotateCcw className={`w-5 h-5 transition-transform duration-200 ${currentIndex > 0 ? "group-hover:-rotate-45 text-amber-400" : "group-hover:-rotate-45 text-zinc-400"}`} />
          </button>

          {/* 2. Pass Button (Red X) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe("left");
            }}
            disabled={!!swipeDirection}
            className="w-14 h-14 rounded-full bg-[#12131a]/95 hover:bg-zinc-800 backdrop-blur-md border-2 border-rose-500/80 text-rose-500 flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50 group"
            title="Pass (Swipe Left)"
          >
            <X className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* 3. Super Like Button (Blue Star) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe("up");
            }}
            disabled={!!swipeDirection}
            className="w-14 h-14 rounded-full bg-[#12131a]/95 hover:bg-zinc-800 backdrop-blur-md border-2 border-sky-500/80 text-sky-400 flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50 group"
            title="Super Like (Swipe Up)"
          >
            <Star className="w-6 h-6 fill-sky-400 stroke-sky-400 group-hover:scale-115 transition-transform duration-200" />
          </button>

          {/* 4. Like Button (Green Heart) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe("right");
            }}
            disabled={!!swipeDirection}
            className="w-16 h-16 rounded-full bg-[#12131a]/95 hover:bg-zinc-800 backdrop-blur-md border-2 border-emerald-500/90 text-emerald-400 flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer disabled:opacity-50 group"
            title="Like (Swipe Right)"
          >
            <Heart className="w-8 h-8 fill-emerald-400 stroke-emerald-400 group-hover:scale-115 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Daily Swipe Limit / Low Quota Alert Modal */}
      <SwipeLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        dailyLimit={dailyLimit}
        swipesRemaining={swipesRemaining}
        countdown={countdown}
        customMessage={limitErrorMessage}
      />
    </div>
  );
}

export default SwipeCard;

