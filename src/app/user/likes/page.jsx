"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  X,
  Star,
  Sparkles,
  MapPin,
  Briefcase,
  BadgeCheck,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  RefreshCw,
  Eye,
  MessageCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  UserCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/utility/imageUrl";
import matchService from "@/lib/services/match.service";
import chatService from "@/lib/services/chat.service";
import socketService from "@/lib/services/socket.service";
import { fetchWhoLikedYouProfiles } from "@/lib/common/api";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

export default function WhoLikedYouPage() {
  const router = useRouter();
  const { user, profile: authProfile, subscription } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "superlike" | "nearby"

  // Mutual Match Modal State
  const [mutualMatchPopup, setMutualMatchPopup] = useState(null);
  const [matchOpenerText, setMatchOpenerText] = useState("Hey! It's a match ✨ Excited to connect with you!");

  // Profile Preview Modal
  const [inspectProfile, setInspectProfile] = useState(null);
  const [inspectPhotoIndex, setInspectPhotoIndex] = useState(0);

  // Undo / Rewind Stack for recently acted-upon cards
  const [swipedHistory, setSwipedHistory] = useState([]);
  const [exitingCardId, setExitingCardId] = useState(null);
  const [actionNotice, setActionNotice] = useState("");

  const isVip = Boolean(
    subscription?.status === "active" ||
    subscription?.isVip ||
    subscription?.isActive ||
    user?.role === "admin"
  );

  const userAvatar =
    authProfile?.photos?.[0]?.url ||
    authProfile?.photos?.[0] ||
    authProfile?.photo ||
    user?.avatar ||
    user?.photo ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

  const hasLoadedRef = useRef(false);

  // Load feed and count (single API hit for the feed, count is derived from list)
  const loadWhoLikedYouData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const feedList = await fetchWhoLikedYouProfiles(
        { includeSwiped: false },
        showRefreshSpinner
      );

      const validList = Array.isArray(feedList) ? feedList : [];
      setProfiles(validList);
      const countVal = validList.length;
      setTotalCount(countVal);

      // Notify global listeners (e.g. sidebar, header)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj-who-liked-you-updated", {
            detail: { count: countVal },
          })
        );
      }
    } catch (err) {
      console.warn("Error loading who liked you data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadWhoLikedYouData();
  }, []);

  // Listen for socket match events
  useEffect(() => {
    const unsubMatch = typeof socketService.onNewMatch === "function"
      ? socketService.onNewMatch(() => {
          loadWhoLikedYouData();
        })
      : null;

    return () => {
      if (unsubMatch) unsubMatch();
    };
  }, []);

  // Filter profiles based on active tab
  const filteredProfiles = profiles.filter((p) => {
    if (activeFilter === "superlike") {
      return Boolean(p.isSuperLike || p.hasSuperLiked || p.likeAction === "superlike");
    }
    if (activeFilter === "nearby") {
      return (p.distanceKm || 10) <= 15;
    }
    return true;
  });

  const superLikesCount = profiles.filter(
    (p) => Boolean(p.isSuperLike || p.hasSuperLiked || p.likeAction === "superlike")
  ).length;

  // Handle Swipe / Action (like, dislike, superlike)
  const handleAction = async (targetProfile, action = "like") => {
    if (!targetProfile) return;
    const profileId = targetProfile._id || targetProfile.id || targetProfile.userId;
    if (!profileId) return;

    // Trigger visual exit animation for grid
    setExitingCardId(profileId);

    // Save to history for undo
    setSwipedHistory((prev) => [{ profile: targetProfile, action }, ...prev]);

    // Optimistically remove from list
    setTimeout(() => {
      setProfiles((prev) => prev.filter((p) => (p._id || p.id) !== profileId));
      setExitingCardId(null);
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj-who-liked-you-updated", {
            detail: { count: Math.max(0, totalCount - 1) },
          })
        );
      }
    }, 240);

    // Close preview modal if inspecting this profile
    if (inspectProfile && (inspectProfile._id || inspectProfile.id) === profileId) {
      setInspectProfile(null);
    }

    // Call backend API
    try {
      const res = await matchService.swipeUser(profileId, action);

      if (action === "like" || action === "superlike") {
        // Since they already liked the user, this creates a mutual match!
        setMutualMatchPopup({
          partnerName: targetProfile.name,
          partnerPhoto: targetProfile.photos?.[0] || targetProfile.photo,
          partnerId: profileId,
          conversationId: res?.conversation?._id || res?.match?._id || `conv_${profileId}`,
          isSuperLike: action === "superlike" || targetProfile.isSuperLike,
        });

        // Notify app of match update
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("pj-matches-updated", {
              detail: { count: "+1" },
            })
          );
        }
      } else {
        setActionNotice(`Passed on ${targetProfile.name}. Undo anytime with Rewind.`);
        setTimeout(() => setActionNotice(""), 3500);
      }
    } catch (err) {
      console.warn("Swipe action failed:", err);
    }
  };

  // Rewind / Undo last swipe
  const handleRewind = async (profileToRewind) => {
    let target = profileToRewind;
    if (!target && swipedHistory.length > 0) {
      target = swipedHistory[0]?.profile;
    }

    if (!target) {
      setActionNotice("No swipes to undo in this session.");
      setTimeout(() => setActionNotice(""), 3000);
      return;
    }

    const targetId = target._id || target.id;
    try {
      if (targetId) {
        await matchService.rewindSwipe(targetId);
      }

      // Re-insert profile back at the beginning of the list
      setProfiles((prev) => [target, ...prev]);
      setTotalCount((prev) => prev + 1);
      setSwipedHistory((prev) => prev.filter((item) => (item.profile?._id || item.profile?.id) !== targetId));
      setActionNotice(`Restored ${target.name}'s card ✨`);
      setTimeout(() => setActionNotice(""), 3500);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj-who-liked-you-updated", {
            detail: { count: totalCount + 1 },
          })
        );
      }
    } catch (err) {
      console.warn("Rewind failed:", err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-16 lg:pb-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & CONTROLS */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 flex-shrink-0 animate-pulse">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                Who Liked You
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                {totalCount} {totalCount === 1 ? "Admirer" : "Admirers"}
              </span>
              {isVip && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                  👑 VIP Unlocked
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              These singles swiped right on you. Swipe right back to match instantly!
            </p>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          {/* Refresh Button */}
          <button
            onClick={() => loadWhoLikedYouData(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer disabled:opacity-50"
            title="Refresh Admirers List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-rose-500" : ""}`} />
          </button>

          {/* Rewind Button (if history available) */}
          {swipedHistory.length > 0 && (
            <button
              onClick={() => handleRewind()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Undo last swipe"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo ({swipedHistory.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice("")}
            className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. FILTER TABS (All, Super Likes, Nearby) */}
      {/* ============================================================ */}
      {profiles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === "all"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>All Likes ({profiles.length})</span>
          </button>

          {superLikesCount > 0 && (
            <button
              onClick={() => setActiveFilter("superlike")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                activeFilter === "superlike"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:border-sky-300"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-sky-400 stroke-sky-400" />
              <span>Super Likes ({superLikesCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveFilter("nearby")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === "nearby"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-300"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearby Singles (&lt; 15 km)</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT: LOADING / EMPTY / GRID / DECK */}
      {/* ============================================================ */}
      {isLoading ? (
        /* Radar Skeleton Loader */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
          <div className="relative flex items-center justify-center w-36 h-36">
            <div className="absolute w-full h-full rounded-full border-2 border-rose-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
              <Heart className="w-10 h-10 fill-white animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Finding who liked you...
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Checking your secret admirers and priority super likes
            </p>
          </div>
        </div>
      ) : filteredProfiles.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-100 to-pink-100 dark:from-zinc-800 dark:to-zinc-800 text-rose-500 flex items-center justify-center shadow-inner">
            <Eye className="w-10 h-10 stroke-[1.75]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {profiles.length > 0 && activeFilter !== "all"
                ? "No matches for this filter"
                : "You're all caught up!"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              {profiles.length > 0 && activeFilter !== "all"
                ? "Try switching back to 'All Likes' to see all your admirers."
                : "No pending likes right now. As soon as someone swipes right on your profile, they will appear here instantly!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            {profiles.length > 0 && activeFilter !== "all" ? (
              <button
                onClick={() => setActiveFilter("all")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-500/25"
              >
                View All Likes ({profiles.length})
              </button>
            ) : (
              <>
                <Link
                  href="/user"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Discover Feed</span>
                </Link>
                <Link
                  href="/user/subscriptions"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Boost Profile (10x Likes)</span>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* GRID VIEW: INSTANT MATCH CARDS WITH DIRECT ACCEPT / REJECT  */
        /* ============================================================ */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProfiles.map((item) => {
            const cardId = item._id || item.id;
            const isExiting = exitingCardId === cardId;
            const primaryPhoto = resolveImageUrl(
              item.photos?.[0] || item.photo || item.avatar,
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
            );

            return (
              <div
                key={cardId}
                className={`group relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-[440px] sm:h-[460px] ${
                  isExiting
                    ? "opacity-0 scale-90 translate-y-4 pointer-events-none transition-all duration-200"
                    : "hover:-translate-y-1"
                }`}
              >
                {/* Background Photo */}
                <div
                  onClick={() => {
                    setInspectProfile(item);
                    setInspectPhotoIndex(0);
                  }}
                  className="absolute inset-0 cursor-pointer overflow-hidden"
                >
                  <img
                    src={primaryPhoto}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-50% to-black/25 pointer-events-none" />
                </div>

                {/* Top Badges Row */}
                <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2 pointer-events-none">
                  {/* Super Like / Liked You Pill */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Boolean(item.isSuperLike || item.hasSuperLiked || item.likeAction === "superlike") ? (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1 border border-sky-300/40 animate-pulse">
                        <Star className="w-3.5 h-3.5 fill-white stroke-white" />
                        <span>Super Liked You</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1 border border-rose-300/40">
                        <Heart className="w-3.5 h-3.5 fill-white stroke-white" />
                        <span>Liked You</span>
                      </span>
                    )}

                    {Boolean(item.isBoosted || item.boostMode) && (
                      <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md flex items-center gap-0.5">
                        <Zap className="w-3 h-3 fill-white" />
                        <span>Boost</span>
                      </span>
                    )}
                  </div>

                  {/* Distance Pill */}
                  <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold border border-white/15 flex items-center gap-1">
                    <span className="text-rose-400">📍</span>
                    <span>{item.distanceKm || 4} km</span>
                  </span>
                </div>

                {/* Inspect Info Button (Corner) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectProfile(item);
                    setInspectPhotoIndex(0);
                  }}
                  aria-label="View Profile Details"
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 cursor-pointer"
                  title="View full profile"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Bottom Information & Action Bar */}
                <div className="relative z-10 mt-auto p-4 text-white flex flex-col justify-end space-y-2.5 pointer-events-none">
                  {/* Name, Age & Verified Check */}
                  <div
                    onClick={() => {
                      setInspectProfile(item);
                      setInspectPhotoIndex(0);
                    }}
                    className="cursor-pointer pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 drop-shadow-md">
                      <h3 className="text-lg sm:text-xl font-black text-white truncate">
                        {item.name}, {item.age}
                      </h3>
                      {Boolean(item.isVerified) && (
                        <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Occupation & City */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium truncate mt-0.5">
                      <span>{item.occupation || item.education || "Member"}</span>
                      <span>•</span>
                      <span>{item.city || item.location || "Nearby"}</span>
                    </div>

                    {/* Bio snippet */}
                    {item.bio && (
                      <p className="text-[11px] text-zinc-300/90 line-clamp-1 mt-1 leading-snug">
                        {item.bio}
                      </p>
                    )}
                  </div>

                  {/* Interests Tags */}
                  {Array.isArray(item.interests) && item.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 pointer-events-auto">
                      {item.interests.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10"
                        >
                          {String(tag).replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* FLOATING ACTION BUTTONS: REJECT, SUPERLIKE, ACCEPT       */}
                  {/* ======================================================== */}
                  <div className="pt-1 flex items-center justify-between gap-2.5 pointer-events-auto">
                    {/* 1. Reject / Pass Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item, "dislike");
                      }}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-white/10 dark:bg-black/50 hover:bg-rose-500/90 backdrop-blur-md border border-white/20 hover:border-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md group/btn"
                      title="Pass / Reject"
                    >
                      <X className="w-4 h-4 stroke-[2.5] text-rose-400 group-hover/btn:text-white transition-colors" />
                      <span className="text-zinc-200 group-hover/btn:text-white">Pass</span>
                    </button>

                    {/* 2. Super Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item, "superlike");
                      }}
                      className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/50 hover:bg-sky-500 backdrop-blur-md border border-white/20 hover:border-sky-400 text-sky-400 hover:text-white transition-all active:scale-95 cursor-pointer shadow-md group/star"
                      title="Super Like Back"
                    >
                      <Star className="w-4 h-4 fill-sky-400 stroke-sky-400 group-hover/star:fill-white group-hover/star:stroke-white transition-all" />
                    </button>

                    {/* 3. Accept / Match Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item, "like");
                      }}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                      title="Accept & Match Instantly"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Match</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MUTUAL MATCH CELEBRATION MODAL                           */}
      {/* ============================================================ */}
      {mutualMatchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-7 text-center shadow-2xl border border-rose-500/30 z-10 animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setMutualMatchPopup(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Heart Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-rose-500/30 animate-bounce">
              <Heart className="w-8 h-8 fill-white" />
            </div>

            {/* Match Heading */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                It&apos;s a Match! 🎉
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                You and <strong className="text-zinc-900 dark:text-white">{mutualMatchPopup.partnerName}</strong> liked each other.
              </p>
            </div>

            {/* Connecting Avatars */}
            <div className="flex items-center justify-center -space-x-4 py-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-rose-500 shadow-xl">
                <img
                  src={resolveImageUrl(userAvatar)}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="z-10 w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-zinc-900">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-pink-500 shadow-xl">
                <img
                  src={resolveImageUrl(
                    mutualMatchPopup.partnerPhoto,
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  )}
                  alt={mutualMatchPopup.partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Icebreaker Opener Box */}
            <div className="space-y-2 text-left bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Send an Icebreaker ✨
              </label>
              <input
                type="text"
                value={matchOpenerText}
                onChange={(e) => setMatchOpenerText(e.target.value)}
                placeholder="Say something charming..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-all"
              />

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Hey! It's a match ✨",
                  "Coffee or chai? ☕",
                  "Loved your profile vibe! ✨",
                  "Hey there! How's your day? 😊",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setMatchOpenerText(chip)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500/20 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Send Message & Chat / Keep Swiping */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  const textToSend = (matchOpenerText || "Hey! It's a match ✨ Nice to connect with you!").trim();
                  const convId = mutualMatchPopup.conversationId || `conv_${mutualMatchPopup.partnerId}`;
                  const currentUserId = user?._id || user?.id;

                  if (convId && textToSend && typeof socketService.emitSendMessage === "function") {
                    socketService.emitSendMessage({
                      conversationId: String(convId).replace(/^conv_/, ""),
                      chatId: String(convId).replace(/^conv_/, ""),
                      roomId: String(convId).replace(/^conv_/, ""),
                      sender: currentUserId,
                      senderId: currentUserId,
                      receiver: mutualMatchPopup.partnerId,
                      receiverId: mutualMatchPopup.partnerId,
                      recipientId: mutualMatchPopup.partnerId,
                      content: textToSend,
                      text: textToSend,
                      message: textToSend,
                      createdAt: new Date().toISOString(),
                    });
                  }

                  setMutualMatchPopup(null);
                  router.push(`/user/matches?id=${convId}&msg=${encodeURIComponent(textToSend)}`);
                }}
                className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Message & Chat</span>
              </button>

              <button
                onClick={() => setMutualMatchPopup(null)}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Keep Reviewing Likes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. FULL PROFILE INSPECTION MODAL                            */}
      {/* ============================================================ */}
      {inspectProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setInspectProfile(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto">
              {/* Photo Gallery Viewer */}
              <div className="relative w-full h-80 sm:h-96 bg-zinc-950">
                <img
                  src={resolveImageUrl(
                    inspectProfile.photos?.[inspectPhotoIndex] ||
                    inspectProfile.photo ||
                    inspectProfile.avatar
                  )}
                  alt={inspectProfile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Photo Pagination Arrows */}
                {Array.isArray(inspectProfile.photos) && inspectProfile.photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setInspectPhotoIndex((prev) =>
                          prev > 0 ? prev - 1 : inspectProfile.photos.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setInspectPhotoIndex((prev) =>
                          prev < inspectProfile.photos.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4 pointer-events-none">
                      {inspectProfile.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === inspectPhotoIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Name & Basic Info on Photo */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black">
                      {inspectProfile.name}, {inspectProfile.age}
                    </h2>
                    {Boolean(inspectProfile.isVerified) && (
                      <BadgeCheck className="w-6 h-6 text-sky-400 fill-sky-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium mt-1">
                    <span>💼 {inspectProfile.occupation || inspectProfile.education || "Member"}</span>
                    <span>•</span>
                    <span>📍 {inspectProfile.city || inspectProfile.location || "Nearby"} ({inspectProfile.distanceKm || 4} km away)</span>
                  </div>
                </div>
              </div>

              {/* Profile Details Body */}
              <div className="p-5 sm:p-6 space-y-5 text-zinc-800 dark:text-zinc-200">
                {/* Admirer Status Box */}
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {Boolean(inspectProfile.isSuperLike || inspectProfile.hasSuperLiked)
                          ? "Super Liked Your Profile ⭐"
                          : "Liked Your Profile ❤️"}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Match instantly by tapping the Match button below
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {inspectProfile.bio && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                      About Me
                    </h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {inspectProfile.bio}
                    </p>
                  </div>
                )}

                {/* Relationship Intent */}
                {inspectProfile.lookingFor && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                      Relationship Goal
                    </h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      💖 {inspectProfile.lookingFor}
                    </span>
                  </div>
                )}

                {/* Interests */}
                {Array.isArray(inspectProfile.interests) && inspectProfile.interests.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Passions & Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {inspectProfile.interests.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 capitalize"
                        >
                          {String(tag).replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions in Inspection Modal */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleAction(inspectProfile, "dislike")}
                className="flex-1 py-3 px-4 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-zinc-800 dark:text-zinc-200 hover:text-rose-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Pass</span>
              </button>
              <button
                onClick={() => handleAction(inspectProfile, "superlike")}
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800 hover:bg-sky-500 hover:text-white transition-all cursor-pointer"
                title="Super Like"
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={() => handleAction(inspectProfile, "like")}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Match Instantly</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
