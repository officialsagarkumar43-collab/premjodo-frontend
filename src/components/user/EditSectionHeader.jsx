"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Camera,
  Heart,
  Smile,
  BookOpen,
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/common/utils";

export const EDIT_SECTIONS = [
  { id: "basic", label: "Basic Info", href: "/user/profile/edit/basic", icon: User, step: "1" },
  { id: "photos", label: "Photos", href: "/user/profile/edit/photos", icon: Camera, step: "2" },
  { id: "intent", label: "Intent", href: "/user/profile/edit/intent", icon: Heart, step: "3" },
  { id: "interests", label: "Interests", href: "/user/profile/edit/interests", icon: Smile, step: "4" },
  { id: "lifestyle", label: "Bio & Lifestyle", href: "/user/profile/edit/lifestyle", icon: BookOpen, step: "5" },
  { id: "preferences", label: "Preferences", href: "/user/profile/edit/preferences", icon: SlidersHorizontal, step: "6" },
];

export function EditSectionHeader({ currentSectionId }) {
  const pathname = usePathname();

  return (
    <div className="w-full space-y-4 mb-6 select-none">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-rose-500" />
          </div>
          <span>Back to Profile Overview</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-medium">Profile Editor</span>
        </div>
      </div>

      {/* Stepper Navigation Bar - Hidden on Mobile */}
      <div className="hidden md:block w-full">
        <nav
          aria-label="Profile edit sections"
          className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-xs"
        >
          {EDIT_SECTIONS.map((sec) => {
            const isActive =
              currentSectionId === sec.id || pathname === sec.href;
            const Icon = sec.icon;

            return (
              <Link
                key={sec.id}
                href={sec.href}
                className={cn(
                  "flex-1 basis-1/3 sm:basis-0 flex items-center justify-center gap-2 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all duration-200 text-center min-w-0 group",
                  isActive
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-md shadow-rose-500/25 scale-[1.02] z-10"
                    : "text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-colors",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-300"
                  )}
                >
                  {sec.step}
                </div>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{sec.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
