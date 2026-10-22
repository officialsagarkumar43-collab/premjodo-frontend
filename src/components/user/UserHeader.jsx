"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Flame,
  MessageCircle,
  User,
  Crown,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Wallet,
  Coins,
  Plus,
  ArrowUpRight,
  History,
  Globe,
  Zap,
  Rocket,
  Eye,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LanguageModal } from "@/components/common/LanguageModal";
import { LanguageIcon } from "@/components/common/LanguageIcon";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import socketService from "@/lib/services/socket.service";
import battleService from "@/lib/services/battle.service";
import authService from "@/lib/services/auth.service";
import matchService from "@/lib/services/match.service";
import { isBattleReady } from "@/lib/common/featureFlags";

export function UserHeader({ onToggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, subscription, logout } = useAuth();
  const { language, supportedLanguages } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [wallet, setWallet] = useState(() => battleService.getWallet());
  const [likesCount, setLikesCount] = useState(0);

  const currentLangObj =
    supportedLanguages?.find((l) => l.code === language) ||
    supportedLanguages?.[0] || { code: "en", name: "English", nativeName: "English" };

  const profileDropdownRef = useRef(null);
  const walletDropdownRef = useRef(null);

  useEffect(() => {
    const handleWalletUpdated = (e) => {
      if (e.detail) {
        setWallet(e.detail);
      } else {
        setWallet(battleService.getWallet());
      }
    };

    window.addEventListener("pj-wallet-updated", handleWalletUpdated);
    setWallet(battleService.getWallet());


    const handleLikesUpdated = (e) => {
      if (typeof e?.detail?.count === "number") {
        setLikesCount(e.detail.count);
      }
    };
    window.addEventListener("pj-who-liked-you-updated", handleLikesUpdated);

    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("pj-wallet-updated", handleWalletUpdated);
      window.removeEventListener("pj-who-liked-you-updated", handleLikesUpdated);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const getPageMeta = () => {
    if (pathname === "/user") {
      return { title: "Discover Singles", subtitle: "Find meaningful connections nearby" };
    }
    if (pathname === "/user/matches") {
      return { title: "Matches & Messages", subtitle: "Chat with your mutual connections" };
    }
    if (pathname === "/user/chat") {
      return { title: "Direct Chat", subtitle: "Private conversation" };
    }
    if (pathname?.startsWith("/user/battle")) {
      return { title: "Match Battle", subtitle: "Real-Cash 1v1 & Multiplayer Arena" };
    }
    if (pathname === "/user/wallet/add") {
      return { title: "Add Cash", subtitle: "Instant 100% Safe Deposit to Battle Wallet" };
    }
    if (pathname === "/user/wallet/withdraw") {
      return { title: "Withdraw Winnings", subtitle: "Instant 0% Fee Payout to UPI & Bank" };
    }
    if (pathname?.startsWith("/user/wallet")) {
      return { title: "Battle Wallet", subtitle: "Instant Deposits, Winnings & Transaction History" };
    }
    if (pathname === "/user/profile") {
      return { title: "My Profile", subtitle: "Manage your profile details & public card" };
    }
    if (pathname?.startsWith("/user/profile/edit/basic")) {
      return { title: "Edit Basic Information", subtitle: "Update your name, age & gender" };
    }
    if (pathname?.startsWith("/user/profile/edit/photos")) {
      return { title: "Photos & Media", subtitle: "Upload avatars and showcase your best moments" };
    }
    if (pathname?.startsWith("/user/profile/edit/intent")) {
      return { title: "Relationship Intent", subtitle: "Define what kind of relationship you're seeking" };
    }
    if (pathname?.startsWith("/user/profile/edit/interests")) {
      return { title: "Interests & Passions", subtitle: "Pick the hobbies and topics you love" };
    }
    if (pathname?.startsWith("/user/profile/edit/lifestyle")) {
      return { title: "Bio & Lifestyle Details", subtitle: "Tell your story, education & beliefs" };
    }
    if (pathname?.startsWith("/user/profile/edit/preferences")) {
      return { title: "Discovery Preferences", subtitle: "Set age, distance & match filters" };
    }
    if (pathname?.startsWith("/user/likes") || pathname?.startsWith("/user/who-liked-you")) {
      return { title: "Who Liked You", subtitle: "Instant Match Grid & Admirers" };
    }
    if (pathname?.startsWith("/user/subscription")) {
      return { title: "My Subscription", subtitle: "Manage your VIP membership, perks & billing" };
    }
    return { title: "Dashboard", subtitle: "Welcome to Prem Jodo" };
  };

  const meta = getPageMeta();
  const isEditing = pathname?.startsWith("/user/profile/edit/");

  const handleLogout = async () => {
    socketService.disconnect();
    await logout();
    router.replace("/");
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-14 sm:h-16 lg:h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-colors select-none">
      {/* Left side: Hamburger (mobile) + Page Title / Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center">
          <Logo href="/user" size="sm" />
        </div>

        {/* Desktop Breadcrumb & Heading */}
        <div className="hidden lg:flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate tracking-tight">
            {meta.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Quick Action Buttons, Theme Toggle, User Profile Avatar, Wallet */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Discover Shortcut */}
        <Link
          href="/user"
          title="Discover Singles"
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            pathname === "/user"
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Discover</span>
        </Link>

        {/* Quick Matches Shortcut */}
        <Link
          href="/user/matches"
          title="Matches & Messages"
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            pathname === "/user/matches"
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-pink-500" />
          <span>Matches</span>
        </Link>

        {/* Active Profile Boost indicator */}
        {activeProfile?.isBoosted && (
          <Link
            href="/user/subscriptions"
            title="Profile Boost Active - Ranked #1 in Discovery Deck"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-400 animate-pulse hover:bg-amber-500/25 transition-all shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Boosted</span>
          </Link>
        )}

        {/* Upgrade / Subscription Badge button */}
        <Link
          href="/user/subscriptions"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border border-amber-300/40 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 hover:scale-102 transition-transform shadow-2xs"
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>{subscription?.isActive ? "PRO Member" : "Upgrade PRO"}</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsWalletDropdownOpen(false);
            }}
            className="flex items-center p-1 sm:p-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-400/80 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs active:scale-95 group"
            title="My Profile & Settings"
            aria-label="User Profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-rose-500/60 group-hover:ring-rose-500 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* Dropdown Box */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {displayName}
                  </p>
                  {hasVipBadge && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-xs flex-shrink-0 animate-pulse">
                      👑 VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email || "Signed In"}
                </p>
                {hasVipBadge && (
                  <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>VIP Member Active</span>
                  </div>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/user/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                >
                  <User className="w-4 h-4 text-rose-500" />
                  <span>My Profile Overview</span>
                </Link>
                <Link
                  href="/user/profile/edit/basic"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Edit Profile Details</span>
                </Link>
                <Link
                  href="/user/subscriptions"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>My Subscription</span>
                </Link>
                <Link
                  href="/safety"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Safety Tips</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLangOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Language ({currentLangObj?.nativeName || currentLangObj?.name || "English"})</span>
                  </div>
                  <LanguageIcon code={language} symbol={currentLangObj?.symbol} size="xs" className="text-rose-500 font-bold" />
                </button>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Battle Wallet Section on the Just Right of Profile */}
        {isBattleReady && (
          <div className="relative" ref={walletDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsWalletDropdownOpen(!isWalletDropdownOpen);
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-2xs cursor-pointer group"
              title="Battle Cash Wallet"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">
                  Wallet
                </span>
                <span className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                  ₹{Number(wallet?.balance ?? 0)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
            </button>

            {/* Wallet Dropdown Menu */}
            {isWalletDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                {/* Header inside dropdown */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Battle Wallet
                    </span>
                  </div>
                  <Link
                    href="/user/wallet"
                    onClick={() => setIsWalletDropdownOpen(false)}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    Manage Page →
                  </Link>
                </div>

                {/* Total Balance Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-inner">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Total Available Balance
                  </span>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white mt-0.5">
                    ₹{Number(wallet?.balance ?? 0)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Deposit Cash</span>
                      <span className="font-bold text-white">₹{wallet?.depositBalance || 0}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Winnings</span>
                      <span className="font-bold text-emerald-400">₹{wallet?.winningsBalance || wallet?.winningBalance || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Page Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/user/wallet/add"
                    onClick={() => setIsWalletDropdownOpen(false)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Cash</span>
                  </Link>
                  <Link
                    href="/user/wallet/withdraw"
                    onClick={() => setIsWalletDropdownOpen(false)}
                    className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Withdraw</span>
                  </Link>
                </div>

                {/* Transaction History & Main Wallet link */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <Link
                    href="/user/wallet"
                    onClick={() => setIsWalletDropdownOpen(false)}
                    className="font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Full Wallet View
                  </Link>
                  <Link
                    href="/user/wallet?tab=history"
                    onClick={() => setIsWalletDropdownOpen(false)}
                    className="font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>

    {/* Language Selection Modal */}
    <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
  </>
  );
}

