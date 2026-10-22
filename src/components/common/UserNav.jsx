"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  MessageCircle,
  User,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Crown,
  Swords,
  ShoppingBag,
  Film,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageModal } from "@/components/common/LanguageModal";
import { LanguageIcon } from "@/components/common/LanguageIcon";
import { cn } from "@/lib/common/utils";
import matchService from "@/lib/services/match.service";
import chatService from "@/lib/services/chat.service";
import { getAccessToken } from "@/lib/services/apiClient";
import socketService from "@/lib/services/socket.service";
import authService from "@/lib/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { isBattleReady } from "@/lib/common/featureFlags";
import { extractPrimaryPhoto } from "@/lib/utility/imageUrl";

export function UserNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, subscription, logout } = useAuth();
  const { t, language, supportedLanguages } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [matchesCount, setMatchesCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const membership = subscription;

  const currentLangObj =
    supportedLanguages?.find((l) => l.code === language) || supportedLanguages?.[0] || { code: "en", name: "English" };

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setImgError(false);
  }, [pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    const currentUser = authService.getUser();
    const currentUserId = currentUser?._id || currentUser?.id;
    if (currentUserId) {
      socketService.connect(currentUserId);
    }

    async function loadMatchesCount() {
      if (!getAccessToken()) return;

      try {
        const [mList, cList] = await Promise.all([
          matchService.getMatches().catch(() => []),
          chatService.getConversations().catch(() => []),
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

        const count = uniquePartners.size;
        if (isMounted) {
          setMatchesCount(count);
        }
      } catch {}
    }

    loadMatchesCount();

    const unsubMsg = socketService.onMessageReceived(() => {
      setMatchesCount((prev) => Math.max(1, prev + 1));
      loadMatchesCount();
    });

    const unsubMatch = socketService.onNewMatch(() => {
      setMatchesCount((prev) => Math.max(1, prev + 1));
      loadMatchesCount();
    });

    const unsubConv = socketService.onConversationUpdated(() => {
      loadMatchesCount();
    });

    const handleMatchesUpdated = (e) => {
      const count = e?.detail?.count ?? e?.detail;
      setTimeout(() => {
        if (!isMounted) return;
        if (typeof count === "number") {
          setMatchesCount(count);
        } else {
          loadMatchesCount();
        }
      }, 0);
    };

    window.addEventListener("pj-matches-updated", handleMatchesUpdated);
    window.addEventListener("pj-message-received", handleMatchesUpdated);
    window.addEventListener("storage", handleMatchesUpdated);

    return () => {
      isMounted = false;
      if (unsubMsg) unsubMsg();
      if (unsubMatch) unsubMatch();
      if (unsubConv) unsubConv();
      window.removeEventListener("pj-matches-updated", handleMatchesUpdated);
      window.removeEventListener("pj-message-received", handleMatchesUpdated);
      window.removeEventListener("storage", handleMatchesUpdated);
    };
  }, [pathname]);

  const navLinks = [
    { label: "Discover", href: "/user", icon: HeartHandshake },
    {
      label: "Matches",
      href: "/user/matches",
      icon: MessageCircle,
      badge: mounted && matchesCount > 0 ? String(matchesCount) : null,
    },
    { label: "Profile", href: "/user/profile", icon: User },
  ];

  const drawerLinks = [
    { label: "Discover Singles", href: "/user", icon: HeartHandshake, desc: "Explore & connect with members" },
    {
      label: "Matches & Chats",
      href: "/user/matches",
      icon: MessageCircle,
      desc: "Live chats and video calls",
      badge: mounted && matchesCount > 0 ? String(matchesCount) : null,
    },
    ...(isBattleReady
      ? [
          {
            label: "Ludo Cash Battle",
            href: "/user/battle",
            icon: Swords,
            desc: "Play 1v1 Ludo for real cash & coins",
            badge: "HOT",
          },
        ]
      : []),
    { label: "Movie Booking", href: "/movies", icon: Film, desc: "Cinema & entertainment tickets for customers", badge: "SOON", isComingSoon: true },
    { label: "Edit Profile", href: "/user/profile", icon: User, desc: "Photos, bio & preferences" },
    { label: "Premium Plans", href: "/subscriptions", icon: CreditCard, desc: "Supercharge your discovery" },
    { label: "Safety Center", href: "/safety", icon: ShieldCheck, desc: "Tips & verification guides" },
    { label: "Help & Support", href: "/support", icon: HelpCircle, desc: "24/7 Member assistance" },
  ];

  const isPathActive = (href) => {
    if (!pathname) return false;
    const normCurrent =
      pathname.endsWith("/") && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;
    const normHref =
      href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;

    if (normHref === "/user") return normCurrent === "/user";
    return normCurrent === normHref || normCurrent.startsWith(normHref + "/");
  };

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    socketService.disconnect();
    await logout();
    router.replace("/");
  };

  const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
  const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;

  const userName =
    user?.fullName ||
    user?.name ||
    profile?.fullName ||
    profile?.firstName ||
    storedUser?.fullName ||
    storedUser?.name ||
    storedProfile?.fullName ||
    storedProfile?.firstName ||
    "Prem Jodo Member";

  const userEmail = user?.email || profile?.email || storedUser?.email || storedProfile?.email || "";
  const userPhoto = extractPrimaryPhoto(
    {
      profile: profile || storedProfile,
      user: user || storedUser,
      ...(storedProfile || {}),
      ...(profile || {}),
      ...(storedUser || {}),
      ...(user || {}),
    },
    ""
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="container h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Back button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Landing"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <Logo size="sm" href="/user" />
          </div>

          {/* Center / Right: Desktop Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    
                    className={cn(
                      "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all",
                      isActive
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 poppins-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 poppins-medium"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && "text-rose-500")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] poppins-bold text-white bg-rose-500 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop User Avatar Pill */}
            <Link
              href="/user/profile"
              
              className="hidden sm:flex items-center p-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer group"
              title="My Profile"
            >
              {userPhoto && !imgError ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-8 h-8 rounded-full object-cover border border-rose-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </Link>

            {/* Theme Toggle (Desktop) */}
            <div className="hidden sm:flex pl-2 border-l border-zinc-200 dark:border-zinc-800 items-center">
              <ThemeToggle />
            </div>

            {/* Mobile Matches Direct Icon */}
            <Link
              href="/user/matches"
              
              className="md:hidden relative p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Matches"
            >
              <MessageCircle className="w-5 h-5" />
              {mounted && matchesCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[9px] poppins-bold text-white bg-rose-500 rounded-full">
                  {matchesCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button (Right Side) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              type="button"
              className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer border border-zinc-200 dark:border-zinc-800"
              title="Open Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-zinc-800 dark:text-zinc-100" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================== */}
      {/* SLIDE-OVER DRAWER (OPENS FROM LEFT)                        */}
      {/* ========================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Sliding Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 z-10 flex flex-col justify-between animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <Logo size="sm" href="/user" />
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Mini Badge Card */}
            <Link
              href="/user/profile"
              
              onClick={() => setIsDrawerOpen(false)}
              className="p-4 mx-4 mt-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-3 hover:border-rose-500/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group"
            >
              {userPhoto && !imgError ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-rose-500/40 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-rose-500/15 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="poppins-bold text-sm text-zinc-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                    {userName}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
                {userEmail && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {userEmail}
                  </p>
                )}
              </div>
            </Link>

            {/* Active Membership Status Card inside Drawer */}
            <div className="mx-4 mt-2">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-pink-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                    <Crown className="w-4 h-4 text-black" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Membership
                    </div>
                    <div className="text-xs poppins-bold text-zinc-900 dark:text-white truncate capitalize">
                      {membership?.planName || membership?.name || membership?.plan || membership?.tier || "Free Member"}
                    </div>
                  </div>
                </div>

                <Link
                  href="/subscriptions"
                  
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-2.5 py-1 rounded-xl text-[11px] poppins-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-500/30 transition-colors flex-shrink-0"
                >
                  {membership && membership.plan && membership.plan !== "free" ? "Manage" : "Upgrade"}
                </Link>
              </div>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              <div className="text-[11px] poppins-semibold uppercase tracking-wider text-zinc-400 px-3 pt-2 pb-1">
                Navigation
              </div>

              {drawerLinks.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    
                    onClick={() => setIsDrawerOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group border",
                      isActive
                        ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "p-2 rounded-xl flex-shrink-0 transition-colors",
                          isActive
                            ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-rose-500 group-hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="poppins-semibold text-sm truncate">{item.label}</div>
                        <div className="text-[11px] text-zinc-400 truncate hidden sm:block">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] poppins-bold text-white bg-rose-500 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform text-zinc-400",
                          isActive ? "text-rose-500 translate-x-0.5" : "group-hover:translate-x-0.5"
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Drawer Bottom Controls: Quick Action Bar (Account, Language, Theme, Logout) */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60">
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* 1. My Account / Edit Profile */}
                <Link
                  href="/user/profile"
                  
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-xs group"
                  title="My Account"
                >
                  <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] poppins-semibold mt-1 truncate max-w-full">Account</span>
                </Link>

                {/* 2. Language Selector */}
                <button
                  type="button"
                  onClick={() => setIsLangOpen(true)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-xs group cursor-pointer"
                  title="Change Language"
                >
                  <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="sm" className="font-bold" />
                  </div>
                  <span className="text-[10px] poppins-semibold mt-1 truncate max-w-full">
                    {t("nav.language", "Language")}
                  </span>
                </button>

                {/* 3. Theme Selector */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all shadow-xs group cursor-pointer"
                  title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
                >
                  <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    {resolvedTheme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] poppins-semibold mt-1 truncate max-w-full">
                    {resolvedTheme === "dark" ? "Light" : "Dark"}
                  </span>
                </button>

                {/* 4. Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-xs group cursor-pointer"
                  title="Log Out"
                >
                  <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] poppins-semibold mt-1 truncate max-w-full">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLangOpen}
        onClose={() => setIsLangOpen(false)}
      />
    </>
  );
}

