"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Preloader } from "@/components/reusable";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { X } from "lucide-react";

import { MobileBottomNav } from "@/components/common/MobileBottomNav";

export default function UserLayoutClient({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Auth, Face Verification & Onboarding guard
  useEffect(() => {
    if (mounted && !isLoading) {
      const hasToken =
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem("pj_access_token"));
      if (!isAuthenticated && !hasToken) {
        router.replace("/");
        return;
      }

      const storedFaceVerified =
        typeof window !== "undefined"
          ? localStorage.getItem("pj_is_face_verified")
          : null;
      const isUserFaceVerified =
        user?.isFaceVerification !== undefined
          ? user.isFaceVerification
          : user?.isFaceVerified !== undefined
          ? user.isFaceVerified
          : storedFaceVerified !== null
          ? storedFaceVerified === "true"
          : null;

      // 1. Priority 1: If face verification is incomplete, immediately redirect to /verify-face
      if (isUserFaceVerified === false || storedFaceVerified === "false") {
        router.replace("/verify-face");
        return;
      }

      const storedOnboarded =
        typeof window !== "undefined"
          ? localStorage.getItem("pj_is_onboarded")
          : null;
      const isUserOnboarded =
        user?.isOnboarded !== undefined
          ? user.isOnboarded
          : storedOnboarded !== null
          ? storedOnboarded === "true"
          : null;

      // 2. Priority 2: If onboarding is incomplete, redirect to /onboarding
      if (isUserOnboarded === false || storedOnboarded === "false") {
        router.replace("/onboarding");
        return;
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  const isBattleGameRoute = pathname?.startsWith("/user/battle/game");

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-white dark:bg-zinc-950 transition-colors relative overflow-x-hidden">
        <Preloader fullScreen={true} />
      </div>
    );
  }

  if (isBattleGameRoute) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#0A0214] flex flex-col">
        <main className="flex-1 w-full h-full">{children}</main>
      </div>
    );
  }

  const isMatchesRoute = Boolean(pathname?.startsWith("/user/matches"));
  const isSwipeRoute = pathname === "/user" || pathname === "/user/";
  const isFixedScreenRoute = isMatchesRoute || isSwipeRoute;

  return (
    <div className="w-full max-w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors relative">
      {/* Desktop Left Sidebar (Fixed w-64 lg:w-72) */}
      <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 h-full max-h-full overflow-hidden z-40">
        <UserSidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full z-10 flex flex-col bg-white dark:bg-zinc-950 shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 z-20"
            >
              <X className="w-4 h-4" />
            </button>
            <UserSidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area: Fixed Header + Scrollable Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full max-h-full overflow-hidden">
        {/* Top Navbar (Desktop Only, fixed at top) */}
        <div className="hidden lg:block flex-shrink-0 z-30">
          <UserHeader onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
        </div>

        <main
          className={`flex-1 w-full max-w-full min-h-0 ${
            isMatchesRoute
              ? "p-0 lg:p-3 flex flex-col h-full max-h-full overflow-hidden"
              : isSwipeRoute
              ? "px-3 pt-2 pb-20 sm:pb-16 lg:p-4 flex flex-col h-full max-h-full justify-center items-center overflow-hidden"
              : "p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain pb-24 lg:pb-8"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
