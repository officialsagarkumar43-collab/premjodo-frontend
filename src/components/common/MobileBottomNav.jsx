"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, User, LogOut, LogIn, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/common/AuthModal";
import socketService from "@/lib/services/socket.service";
import chatService from "@/lib/services/chat.service";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isBattleGame = pathname?.startsWith("/user/battle/game");

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener("pj-open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("pj-open-auth-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    async function loadUnreadCount() {
      try {
        const convs = await chatService.getConversations();
        if (Array.isArray(convs) && isMounted) {
          const totalUnread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }
      } catch {}
    }
    loadUnreadCount();

    const handleMatchUpdate = (e) => {
      if (e?.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
      }
    };

    window.addEventListener("pj-matches-updated", handleMatchUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("pj-matches-updated", handleMatchUpdate);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      socketService.disconnect();
      await logout();
      router.replace("/");
    } catch {
      router.replace("/");
    }
  };

  const handleTabClick = (e, targetHref) => {
    if (!isAuthenticated) {
      e?.preventDefault?.();
      setIsAuthOpen(true);
      return;
    }
    if (targetHref) {
      router.push(targetHref);
    }
  };

  const isSwipeActive = pathname === "/user" || pathname === "/user/";
  const isMessagesActive = pathname?.startsWith("/user/matches");
  const isProfileActive = pathname?.startsWith("/user/profile");

  if (isBattleGame) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200/90 dark:border-zinc-800/80 px-2 pt-1.5 flex items-center justify-between lg:hidden transition-colors select-none pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none"
      >
        {/* 1. Swipe Tab */}
        {isAuthenticated ? (
          <Link
            href="/user"
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div
              className={`flex items-center justify-center w-12 sm:w-14 h-7 rounded-full transition-colors duration-150 ${
                isSwipeActive
                  ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              <Layers className={`w-5 h-5 ${isSwipeActive ? "text-rose-600 dark:text-rose-400 fill-rose-500/20" : "text-zinc-500 dark:text-zinc-400"}`} />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap truncate ${
                isSwipeActive ? "font-semibold text-rose-600 dark:text-rose-400" : "font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              Swipe
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handleTabClick(e)}
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center w-12 sm:w-14 h-7 rounded-full bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors duration-150">
              <Layers className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 whitespace-nowrap truncate">
              Swipe
            </span>
          </button>
        )}

        {/* 2. Messages Tab */}
        {isAuthenticated ? (
          <Link
            href="/user/matches"
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div
              className={`relative flex items-center justify-center w-12 sm:w-14 h-7 rounded-full transition-colors duration-150 ${
                isMessagesActive
                  ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${isMessagesActive ? "text-rose-600 dark:text-rose-400 fill-rose-500/20" : "text-zinc-500 dark:text-zinc-400"}`} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-1.5 sm:right-2.5 min-w-[14px] h-[14px] bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center px-1 shadow-xs pointer-events-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap truncate ${
                isMessagesActive ? "font-semibold text-rose-600 dark:text-rose-400" : "font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              Messages
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handleTabClick(e)}
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center w-12 sm:w-14 h-7 rounded-full bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors duration-150">
              <MessageSquare className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 whitespace-nowrap truncate">
              Messages
            </span>
          </button>
        )}

        {/* 3. Profile Tab */}
        {isAuthenticated ? (
          <Link
            href="/user/profile"
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div
              className={`flex items-center justify-center w-12 sm:w-14 h-7 rounded-full transition-colors duration-150 ${
                isProfileActive
                  ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              <User className={`w-5 h-5 ${isProfileActive ? "text-rose-600 dark:text-rose-400 fill-rose-500/20" : "text-zinc-500 dark:text-zinc-400"}`} />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap truncate ${
                isProfileActive ? "font-semibold text-rose-600 dark:text-rose-400" : "font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
              }`}
            >
              Profile
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => handleTabClick(e)}
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center w-12 sm:w-14 h-7 rounded-full bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors duration-150">
              <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 whitespace-nowrap truncate">
              Profile
            </span>
          </button>
        )}

        {/* 4. Log Out / Sign In Tab */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center w-12 sm:w-14 h-7 rounded-full bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors duration-150">
              <LogOut className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-normal text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 whitespace-nowrap truncate">
              Log Out
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center w-12 sm:w-14 h-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/25 transition-colors duration-150">
              <LogIn className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap truncate">
              Sign In
            </span>
          </button>
        )}
      </nav>

      {/* Auth Modal Triggered via Bottom Nav */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default MobileBottomNav;
