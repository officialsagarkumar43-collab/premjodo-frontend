"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smile,
  Sparkles,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { EditSectionHeader } from "@/components/user/EditSectionHeader";
import { LiveProfileCardPreview } from "@/components/user/LiveProfileCardPreview";
import { FloatingToast } from "@/components/user/FloatingToast";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

const POPULAR_INTERESTS = [
  "Coding", "Design", "Coffee", "Photography", "Road Trips",
  "Music", "Fitness", "Movies", "Foodie", "Travel",
  "Art", "Gaming", "Yoga", "Books", "Anime", "Startups",
  "Cooking", "Hiking", "Dancing", "Pets", "Meditation",
  "Fashion", "Guitar", "Writing", "Cricket", "Board Games"
];

export default function EditInterestsPage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [availableInterests, setAvailableInterests] = useState(POPULAR_INTERESTS);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTagInput, setCustomTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInterests() {
      try {
        let activeProfile = authService.getProfile() || profile;

        if (!activeProfile || !Array.isArray(activeProfile.interests)) {
          const meData = await authService.getCurrentUser(true).catch(() => null);
          if (meData?.profile) {
            activeProfile = meData.profile;
          }
        }

        if (Array.isArray(activeProfile?.interests) && isMounted) {
          const names = activeProfile.interests.map((i) =>
            typeof i === "string" ? i : i.name || i.tag || ""
          ).filter(Boolean);
          setSelectedInterests(names);
        }

        const tags = await authService.getInterests().catch(() => []);
        if (Array.isArray(tags) && tags.length > 0 && isMounted) {
          const tagNames = tags.map((t) => (typeof t === "string" ? t : t.name || t.tag || "")).filter(Boolean);
          const combined = Array.from(new Set([...POPULAR_INTERESTS, ...tagNames]));
          setAvailableInterests(combined);
        }
      } catch (err) {
        console.error("Error loading interests:", err);
      }
    }
    loadInterests();

    const handleAuthChange = () => {
      if (!isMounted) return;
      const p = authService.getProfile();
      if (p && Array.isArray(p.interests)) {
        const names = p.interests.map((i) =>
          typeof i === "string" ? i : i.name || i.tag || ""
        ).filter(Boolean);
        setSelectedInterests(names);
      }
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pj-auth-changed", handleAuthChange);
    };
  }, [profile]);

  const toggleInterest = (tag) => {
    setSelectedInterests((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (exists) {
        return prev.filter((t) => t.toLowerCase() !== tag.toLowerCase());
      } else {
        if (prev.length >= 10) {
          setToastMessage({ type: "error", text: "You can select up to 10 interests" });
          return prev;
        }
        return [...prev, tag];
      }
    });
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;
    if (selectedInterests.length >= 10) {
      setToastMessage({ type: "error", text: "You can select up to 10 interests" });
      return;
    }
    if (!selectedInterests.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setSelectedInterests((prev) => [...prev, clean]);
    }
    if (!availableInterests.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setAvailableInterests((prev) => [clean, ...prev]);
    }
    setCustomTagInput("");
  };

  const handleSave = async (andNext = false) => {
    if (selectedInterests.length === 0) {
      setToastMessage({ type: "error", text: "Please select at least 1 interest" });
      return;
    }

    setIsSaving(true);
    setToastMessage(null);

    try {
      await authService.updateProfile({
        interests: selectedInterests,
      });

      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Interests saved successfully!" });

      if (andNext) {
        setTimeout(() => {
          router.push("/user/profile/edit/lifestyle");
        }, 500);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to update interests" });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredList = availableInterests.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="interests" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Smile className="w-5 h-5 text-rose-500" />
                <span>Interests & Passions</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Select 3 to 10 interests that define your passions and lifestyle.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
              {selectedInterests.length}/10 selected
            </div>
          </div>

          {/* Selected Tags Display */}
          {selectedInterests.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Your Chosen Interests
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedInterests.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600 transition-colors"
                  >
                    <span>{tag}</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search & Custom Add Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interests (e.g. Hiking, Anime, Cricket)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Custom tag add form */}
            <form onSubmit={handleAddCustomTag} className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Or add a custom interest..."
                className="flex-1 px-4 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Available Interest Tags Cloud */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Popular & Trending Tags
            </span>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
              {filteredList.map((tag) => {
                const isSelected = selectedInterests.some(
                  (t) => t.toLowerCase() === tag.toLowerCase()
                );

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-rose-500 text-white shadow-sm shadow-rose-500/25"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/user/profile"
              className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Cancel
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />}
                <span>Save Interests</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:opacity-95 transition-opacity flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Save & Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Column (Right - Desktop Only) */}
        <div className="hidden lg:block lg:col-span-5">
          <LiveProfileCardPreview
            profile={profile}
            user={user}
            liveData={{
              interests: selectedInterests,
            }}
          />
        </div>
      </div>
    </div>
  );
}
