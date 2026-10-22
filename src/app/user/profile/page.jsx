"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Camera,
  Heart,
  Smile,
  BookOpen,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Edit2,
  Crown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  LogOut,
  ChevronRight,
  ExternalLink,
  Mail,
  RefreshCcw,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageModal } from "@/components/common/LanguageModal";
import { LanguageIcon } from "@/components/common/LanguageIcon";
import authService from "@/lib/services/auth.service";
import socketService from "@/lib/services/socket.service";
import { resolveImageUrl, extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import { CameraCaptureModal } from "@/components/common/CameraCaptureModal";
import { ProfilePreviewModal } from "@/components/user/ProfilePreviewModal";

export default function UserProfileDashboardPage() {
  const router = useRouter();
  const { user, profile, subscription, logout, syncAuth } = useAuth();
  const { t, language, supportedLanguages } = useLanguage();

  const [activeProfile, setActiveProfile] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLangObj =
    supportedLanguages?.find((l) => l.code === language) ||
    supportedLanguages?.[0] || { code: "en", name: "English", nativeName: "English" };

  useEffect(() => {
    function loadData() {
      setIsLoading(true);
      try {
        const u = authService.getUser() || user;
        const p = authService.getProfile() || profile;
        setActiveUser(u);
        setActiveProfile(p);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, profile]);

  const handleLogout = async () => {
    socketService.disconnect();
    await logout();
    router.replace("/");
  };

  const handleCameraCapture = async (blob) => {
    setIsCameraOpen(false);
    if (!blob) return;
    try {
      const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: "image/jpeg" });
      await authService.uploadPhotos([file]);
      if (typeof syncAuth === "function") syncAuth();
      const meData = await authService.getCurrentUser(true);
      setActiveUser(meData?.user);
      setActiveProfile(meData?.profile);
    } catch (err) {
      console.error("Failed to upload camera capture:", err);
    }
  };

  const p = activeProfile || profile || {};
  const u = activeUser || user || {};

  const displayName =
    u.fullName ||
    p.fullName ||
    (u.email ? u.email.split("@")[0] : "User");

  const birthYear = p.birthday?.year || p.birthYear || 2000;
  const currentYear = new Date().getFullYear();
  const calculatedAge = Math.max(18, currentYear - (parseInt(birthYear, 10) || 2000));

  const primaryPhoto = extractPrimaryPhoto({ profile: p, user: u }, "");
  const photosList = Array.isArray(p.photos) ? p.photos : [];

  const isFaceVerified =
    u.isFaceVerification === true ||
    u.isFaceVerified === true ||
    p.isFaceVerification === true ||
    p.isFaceVerified === true ||
    u.isVerified === true ||
    p.isVerified === true ||
    authService.isFaceVerified();

  const hasVipBadge = Boolean(
    u?.vipBadge ||
    p?.vipBadge ||
    u?.isVip ||
    p?.isVip ||
    u?.isVIP ||
    p?.isVIP ||
    subscription?.vipBadge ||
    subscription?.isVip ||
    subscription?.plan?.vipBadge ||
    subscription?.plan?.features?.vipBadge ||
    subscription?.features?.vipBadge ||
    (subscription?.isActive && (subscription?.tier !== "free" && subscription?.plan?.type !== "free"))
  );

  // Calculate profile completion percentage
  let completionScore = 0;
  if (displayName) completionScore += 20;
  if (primaryPhoto) completionScore += 25;
  if (photosList.length >= 3) completionScore += 15;
  if (p.bio || p.aboutMe) completionScore += 15;
  if (p.interests && p.interests.length > 0) completionScore += 10;
  if (p.relationshipIntent || p.lookingFor) completionScore += 10;
  if (p.education || p.religion) completionScore += 5;

  const intentLabels = {
    long_term_partner: { label: "Long-term partner", emoji: "💘", desc: "Looking for a committed long-term relationship" },
    long_term_open_to_short: { label: "Long-term, open to short", emoji: "😍", desc: "Seeking long-term, but flexible" },
    short_term_open_to_long: { label: "Short-term, open to long", emoji: "🥂", desc: "Short-term fun, open to serious" },
    short_term_fun: { label: "Short-term fun", emoji: "🎉", desc: "Casual dates and good times" },
    new_friends: { label: "New friends", emoji: "👋", desc: "Socializing & new friendships" },
    still_figuring_it_out: { label: "Still figuring it out", emoji: "🤔", desc: "Going with the flow" },
  };

  const currentIntent =
    intentLabels[p.relationshipIntent || p.lookingFor] ||
    intentLabels["long_term_partner"];

  const birthdayDisplay = p.birthday
    ? typeof p.birthday === "object"
      ? `${String(p.birthday.day || "01").padStart(2, "0")} / ${String(p.birthday.month || "01").padStart(2, "0")} / ${p.birthday.year || 2000}`
      : String(p.birthday)
    : "Not set";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* MOBILE PROFILE HUB (Matches Screenshot exactly for mobile devices) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full max-w-md mx-auto space-y-6 px-1 pt-1 pb-16">
        {/* Top Logo */}
        <div className="flex items-center justify-start pt-1 pb-1">
          <Logo href="/user" size="md" />
        </div>

        {/* Centered Avatar + User Info */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 pt-2">
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 shadow-xl">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover bg-zinc-800"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-white font-extrabold text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Blue Verified Badge */}
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white ring-2 ring-[#0f1117] dark:ring-zinc-950 shadow-md">
              <CheckCircle2 className="w-4 h-4 fill-white text-sky-500" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {u.email || "member@premjodo.com"}
            </p>
          </div>
        </div>

        {/* Upgrade Membership Gradient Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF3366] to-[#FF6B4A] p-5 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black tracking-tight leading-tight">
                  {hasVipBadge ? `${subscription?.plan?.name || "VIP"} Active` : "Upgrade Membership"}
                </h3>
                <p className="text-[11px] text-white/90 leading-tight mt-1 line-clamp-2">
                  {hasVipBadge
                    ? "Enjoy unlimited swipes, priority likes & boost perks"
                    : "Unlock unlimited swipes, instant DMs & profile badges"}
                </p>
              </div>
            </div>

            <Link
              href="/user/subscriptions"
              className="shrink-0 px-4 py-2 rounded-full bg-white text-zinc-900 font-black text-xs uppercase tracking-wider hover:bg-zinc-100 transition-all shadow-md active:scale-95"
            >
              {hasVipBadge ? "MANAGE" : "UPGRADE"}
            </Link>
          </div>
        </div>

        {/* Menu Navigation List Items */}
        <div className="space-y-3">
          <Link
            href="/user/profile/edit/basic"
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-rose-500 transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                My Profile
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Language Selector in User Account Mobile View */}
          <button
            type="button"
            onClick={() => setIsLangOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:text-rose-600 transition-colors font-bold">
                <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Language / भाषा
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentLangObj?.name || "English"} ({currentLangObj?.nativeName || "English"})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                {currentLangObj?.nativeName || "English"}
              </span>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          <Link
            href="/user/subscriptions"
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-rose-500 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Membership Plans
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-rose-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Contact Us
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/cancellation-and-refund"
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-rose-400 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-rose-500 transition-colors">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Cancellation & Refund Policy
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP PROFILE DASHBOARD (Hidden on mobile, rich layout for desktop) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        {/* 1. Hero Profile Banner & Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        {/* Cover Gradient Banner */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/25 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Prem Jodo Profile</span>
            </span>
          </div>
        </div>

        {/* User Info & Actions Bar */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Left: Avatar + Names */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={displayName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 ring-4 ring-white dark:ring-zinc-900 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Edit Photo Quick Trigger Button */}
                <Link
                  href="/user/profile/edit/photos"
                  className="absolute bottom-1 right-1 p-2 rounded-2xl bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-colors"
                  title="Edit Photos"
                >
                  <Camera className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {displayName}
                  </h1>
                  <span className="text-xl sm:text-2xl font-semibold text-zinc-500 dark:text-zinc-400">
                    {calculatedAge}
                  </span>
                  {hasVipBadge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-xs">
                      👑 VIP Member
                    </span>
                  )}
                  {isFaceVerified && (
                    <div className="p-1 rounded-full bg-emerald-500 text-white shadow-xs" title="Face ID Verified Member">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                  <span>{u.email || "Verified Member"}</span>
                  <span>•</span>
                  <span className="capitalize">{p.gender || "Member"}</span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-4 h-4 text-rose-500" />
                <span>Public Card Preview</span>
              </button>

              <Link
                href="/user/profile/edit/basic"
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:opacity-95 transition-opacity flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Profile Completeness Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Profile Strength</span>
                <span className="text-rose-500">{completionScore}% Complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              {completionScore < 100
                ? "💡 Complete all profile sections to get 3x more matches on Discover."
                : "🎉 Great job! Your profile is 100% complete and verified."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Organized Group-Wise Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* GROUP 1: Basic Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Basic Information
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Step 1</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Full Name</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                  {displayName}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Age</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {calculatedAge} Years
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Date of Birth</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {birthdayDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Gender</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                  {p.gender || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/user/profile/edit/basic"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Basic Info</span>
          </Link>
        </div>

        {/* GROUP 2: Photos & Media */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Photos & Media
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                {photosList.length}/6 Slots
              </span>
            </div>

            {/* 6 Mini photo slots preview */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, idx) => {
                const photoObj = photosList[idx];
                const url = photoObj ? resolveImageUrl(photoObj) : "";
                const isMain = idx === 0 || photoObj?.isPrimary;

                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
                  >
                    {url ? (
                      <>
                        <img
                          src={url}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isMain && (
                          <div className="absolute top-1 left-1 p-0.5 rounded-full bg-rose-500 text-white">
                            <Star className="w-2.5 h-2.5 fill-white" />
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href="/user/profile/edit/photos"
                        className="w-full h-full flex flex-col items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/user/profile/edit/photos"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Manage Photos</span>
          </Link>
        </div>

        {/* GROUP 3: Relationship Intent */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-500">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Relationship Intent
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Step 3</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentIntent.emoji}</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {currentIntent.label}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {currentIntent.desc}
              </p>
            </div>
          </div>

          <Link
            href="/user/profile/edit/intent"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Change Intent</span>
          </Link>
        </div>

        {/* GROUP 4: Interests & Passions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Interests & Passions
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                {p.interests?.length || 0} Tags
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {p.interests && p.interests.length > 0 ? (
                p.interests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    {typeof tag === "string" ? tag : tag.name || tag.tag}
                  </span>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">No interests selected yet.</p>
              )}
            </div>
          </div>

          <Link
            href="/user/profile/edit/interests"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Interests</span>
          </Link>
        </div>

        {/* GROUP 5: Bio, Lifestyle & Background */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Bio & Lifestyle
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Step 5</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 line-clamp-3 italic">
                "{p.bio || p.aboutMe || "No bio written yet. Tell singles what makes you unique!"}"
              </div>

              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Education</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">
                  {p.education || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Religion</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {p.religion || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/user/profile/edit/lifestyle"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Bio & Lifestyle</span>
          </Link>
        </div>

        {/* GROUP 6: Discovery Preferences */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-200 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Discovery Preferences
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Step 6</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Seeking</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                  {Array.isArray(p.interestedIn) ? p.interestedIn.join(", ") : "Women"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Age Range</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {p.ageRange?.min || 18} - {p.ageRange?.max || 35} yrs
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Max Distance</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {p.maxDistance || 50} km
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/user/profile/edit/preferences"
            className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Preferences</span>
          </Link>
        </div>
      </div>

      {/* 3. Account & Security Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Account Status & Security
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Registered as {u.email || "Member"}. Face ID verification protects your authentic identity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFaceVerified ? (
            <div className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 select-none shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Face Verified</span>
            </div>
          ) : (
            <Link
              href="/verify-face"
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>Verify Face ID</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsLangOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Change Language"
          >
            <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="xs" className="text-rose-500 font-bold" />
            <span>Language: {currentLangObj?.nativeName || currentLangObj?.name || "English"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      </div>

      {/* Public Preview Modal */}
      <ProfilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        profile={p}
        user={u}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </div>
  );
}
