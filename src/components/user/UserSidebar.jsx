"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  MessageCircle,
  User,
  Sparkles,
  ShieldCheck,
  Crown,
  Swords,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  SlidersHorizontal,
  Camera,
  Heart,
  Smile,
  BookOpen,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LanguageModal } from "@/components/common/LanguageModal";
import { LanguageIcon } from "@/components/common/LanguageIcon";
import { cn } from "@/lib/common/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { isBattleReady } from "@/lib/common/featureFlags";
import { extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import socketService from "@/lib/services/socket.service";
import matchService from "@/lib/services/match.service";
import chatService from "@/lib/services/chat.service";
import authService from "@/lib/services/auth.service";
import { getAccessToken } from "@/lib/services/apiClient";

export function UserSidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, subscription, logout } = useAuth();
  const { t, language, supportedLanguages } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [matchesCount, setMatchesCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const cleanPath = (pathname || "").replace(/\/+$/, "");
  const isEditingProfile = cleanPath.startsWith("/user/profile/edit");
  const isProfileRoute = cleanPath.startsWith("/user/profile");

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(true);
  const hasLoadedSidebarRef = useRef(false);

  useEffect(() => {
    if (isProfileRoute) {
      setIsProfileMenuOpen(true);
    }
  }, [isProfileRoute]);

  // Fetch match count & who liked count once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMatchesCount() {
      if (!getAccessToken()) return;
      try {
        const [mList, cList, whoLikedCount] = await Promise.all([
          matchService.getMatches().catch(() => []),
          chatService.getConversations().catch(() => []),
          matchService.getWhoLikedYouCount().catch(() => 0),
        ]);

        const uniquePartners = new Set();
        if (Array.isArray(mList)) {
          mList.forEach((m) => {
            const pid = m?.partner?._id || m?.partnerUserId || m?._id;
            if (pid) uniquePartners.add(String(pid));
          });
        }
        if (Array.isArray(cList)) {
          cList.forEach((c) => {
            const pid = c?.partner?._id || c?.partnerUserId || c?._id;
            if (pid) uniquePartners.add(String(pid));
          });
        }
        if (isMounted) {
          setMatchesCount(uniquePartners.size);
          if (typeof whoLikedCount === "number") {
            setLikesCount(whoLikedCount);
          }
        }
      } catch {}
    }

    if (!hasLoadedSidebarRef.current) {
      hasLoadedSidebarRef.current = true;
      loadMatchesCount();
    }

    const handleWhoLikedUpdated = (e) => {
      if (typeof e?.detail?.count === "number" && isMounted) {
        setLikesCount(e.detail.count);
      }
    };
    window.addEventListener("pj-who-liked-you-updated", handleWhoLikedUpdated);

    const unsubMsg =
      typeof socketService.onMessageReceived === "function"
        ? socketService.onMessageReceived(() => {
            setMatchesCount((prev) => Math.max(1, prev + 1));
            loadMatchesCount();
          })
        : null;

    const unsubMatch =
      typeof socketService.onNewMatch === "function"
        ? socketService.onNewMatch(() => {
            setMatchesCount((prev) => prev + 1);
            loadMatchesCount();
          })
        : null;

    return () => {
      isMounted = false;
      window.removeEventListener("pj-who-liked-you-updated", handleWhoLikedUpdated);
      if (typeof unsubMsg === "function") unsubMsg();
      if (typeof unsubMatch === "function") unsubMatch();
    };
  }, []);

  const handleLogout = async () => {
    try {
      socketService.disconnect();
      await logout();
      if (onClose) onClose();
      router.replace("/");
    } catch {
      router.replace("/");
    }
  };

  const currentLangObj =
    supportedLanguages?.find((l) => l.code === language) ||
    supportedLanguages?.[0] || { code: "en", name: "English" };

  const storedU = typeof window !== "undefined" ? authService.getUser() || {} : {};
  const storedP = typeof window !== "undefined" ? authService.getProfile() || {} : {};
  const activeUser = { ...storedU, ...(user || {}) };
  const activeProfile = { ...storedP, ...(profile || {}) };

  const avatarUrl = extractPrimaryPhoto({ profile: activeProfile, user: activeUser }, "");
  const displayName =
    activeUser?.fullName ||
    activeProfile?.fullName ||
    activeUser?.firstName ||
    activeProfile?.firstName ||
    activeUser?.name ||
    (activeUser?.email ? activeUser.email.split("@")[0] : "User");

  const hasVipBadge = Boolean(
    activeUser?.vipBadge ||
    activeProfile?.vipBadge ||
    user?.vipBadge ||
    profile?.vipBadge ||
    storedU?.vipBadge ||
    storedP?.vipBadge ||
    activeUser?.isVip ||
    activeProfile?.isVip ||
    user?.isVip ||
    profile?.isVip ||
    storedU?.isVip ||
    storedP?.isVip ||
    activeUser?.isVIP ||
    activeProfile?.isVIP ||
    user?.isVIP ||
    profile?.isVIP ||
    subscription?.vipBadge ||
    subscription?.isVip ||
    subscription?.plan?.vipBadge ||
    subscription?.plan?.features?.vipBadge ||
    subscription?.features?.vipBadge ||
    activeUser?.membership?.vipBadge ||
    activeProfile?.membership?.vipBadge ||
    (subscription?.isActive && (subscription?.tier !== "free" && subscription?.plan?.type !== "free")) ||
    (subscription?.status === "active" && subscription?.plan?.type !== "free")
  );

  const navLinks = [
    {
      name: "Discover",
      href: "/user",
      icon: Flame,
      exact: true,
      badge: null,
    },
    {
      name: "Who Liked You",
      href: "/user/likes",
      icon: Eye,
      exact: false,
      badge: likesCount > 0 ? likesCount : null,
    },
    {
      name: "Matches & Chat",
      href: "/user/matches",
      icon: MessageCircle,
      exact: false,
      badge: matchesCount > 0 ? matchesCount : null,
    },
    {
      name: "My Profile",
      href: "/user/profile",
      icon: User,
      exact: false,
      badge: null,
      isExpandable: true,
    },
    ...(isBattleReady
      ? [
          {
            name: "Match Battle",
            href: "/user/battle",
            icon: Swords,
            exact: false,
            badge: "NEW",
          },
        ]
      : []),
    {
      name: "My Subscription",
      href: "/user/subscriptions",
      icon: Crown,
      exact: false,
      badge: subscription?.isActive ? "PRO" : null,
    },
    {
      name: "Safety Center",
      href: "/safety",
      icon: ShieldCheck,
      exact: false,
      badge: null,
    },
  ];

  const profileSubSections = [
    { id: "basic", label: "Basic Info", href: "/user/profile/edit/basic", icon: User },
    { id: "photos", label: "Photos & Media", href: "/user/profile/edit/photos", icon: Camera },
    { id: "intent", label: "Relationship Intent", href: "/user/profile/edit/intent", icon: Heart },
    { id: "interests", label: "Interests & Passions", href: "/user/profile/edit/interests", icon: Smile },
    { id: "lifestyle", label: "Bio & Lifestyle", href: "/user/profile/edit/lifestyle", icon: BookOpen },
    { id: "preferences", label: "Discovery Preferences", href: "/user/profile/edit/preferences", icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 select-none">
      {/* Top Brand Logo Area */}
      <div className="p-5 pb-4 flex items-center justify-start border-b border-zinc-100 dark:border-zinc-900">
        <div onClick={onClose} className="flex items-center gap-2 group focus:outline-none cursor-pointer">
          <Logo href="/user" className="h-8 w-auto transition-transform group-hover:scale-105" />
        </div>
      </div>

      {/* User Mini Profile Badge Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-indigo-50/30 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-900/40 border border-rose-100/60 dark:border-zinc-800/80 shadow-sm transition-all hover:border-rose-200 dark:hover:border-zinc-700">
        <Link
          href="/user/profile"
          onClick={onClose}
          className="flex items-center gap-3 group"
        >
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-500/80 dark:ring-rose-400/80 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {displayName}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 truncate">
              {hasVipBadge || subscription?.isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-xs tracking-wide">
                  👑 VIP Member
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Standard Account</span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Main Menu
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          const isExactProfile = cleanPath === "/user/profile";

          // Exact or section active matching
          let isActive = false;
          let isSoftActive = false;

          if (item.href === "/user/profile") {
            if (isExactProfile) {
              isActive = true;
            } else if (isEditingProfile) {
              isSoftActive = true;
            }
          } else if (item.exact) {
            isActive = cleanPath === item.href;
          } else {
            isActive = cleanPath === item.href || cleanPath.startsWith(item.href);
          }

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center gap-1">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 font-semibold"
                      : isSoftActive
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 font-semibold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-transform group-hover:scale-110",
                        isActive
                          ? "bg-white/20 text-white"
                          : isSoftActive
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-rose-500 dark:group-hover:text-rose-400"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-bold",
                          isActive
                            ? "bg-white text-rose-600 shadow-sm"
                            : "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>

                {item.isExpandable && (
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    aria-label="Toggle profile sub-sections"
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isProfileMenuOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Profile Subsections Accordion / Dropdown */}
              {item.isExpandable && isProfileMenuOpen && (
                <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-rose-200 dark:border-zinc-800 ml-4 my-1">
                  {profileSubSections.map((sub) => {
                    const isSubActive =
                      cleanPath === sub.href || cleanPath.startsWith(sub.href);
                    const SubIcon = sub.icon;

                    return (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group",
                          isSubActive
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-sm shadow-rose-500/25"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <SubIcon
                            className={cn(
                              "w-3.5 h-3.5",
                              isSubActive ? "text-white" : "opacity-70 group-hover:opacity-100"
                            )}
                          />
                          <span>{sub.label}</span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            isSubActive
                              ? "text-white translate-x-0.5 opacity-100"
                              : "opacity-0 group-hover:opacity-100 text-rose-500"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Area */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="grid grid-cols-2 gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
            title="Toggle Theme"
          >
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Language Button */}
          <button
            onClick={() => setIsLangOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
            title="Select Language"
          >
            <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="xs" className="text-rose-500 font-bold" />
            <span className="truncate">
              {t("nav.language", "Language")}
            </span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </aside>
  );
}
