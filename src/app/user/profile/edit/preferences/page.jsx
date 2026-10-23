"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Users,
  Eye,
  Check,
} from "lucide-react";
import { EditSectionHeader } from "@/components/user/EditSectionHeader";
import { LiveProfileCardPreview } from "@/components/user/LiveProfileCardPreview";
import { FloatingToast } from "@/components/user/FloatingToast";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

export default function EditPreferencesPage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [interestedIn, setInterestedIn] = useState(["women"]);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showInDiscovery, setShowInDiscovery] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPreferences() {
      try {
        let activeProfile = authService.getProfile() || profile;

        if (!activeProfile || (!activeProfile.interestedIn && !activeProfile.ageRange)) {
          const meData = await authService.getCurrentUser(true).catch(() => null);
          if (meData?.profile) activeProfile = meData.profile;
        }

        if (!isMounted) return;

        if (activeProfile?.interestedIn) {
          if (Array.isArray(activeProfile.interestedIn)) {
            setInterestedIn(activeProfile.interestedIn.map((s) => String(s).toLowerCase()));
          } else if (typeof activeProfile.interestedIn === "string") {
            setInterestedIn([activeProfile.interestedIn.toLowerCase()]);
          }
        }

        if (activeProfile?.ageRange) {
          if (activeProfile.ageRange.min) setMinAge(activeProfile.ageRange.min);
          if (activeProfile.ageRange.max) setMaxAge(activeProfile.ageRange.max);
        }

        if (activeProfile?.maxDistance) setMaxDistance(activeProfile.maxDistance);
        if (activeProfile?.showInDiscovery !== undefined) {
          setShowInDiscovery(Boolean(activeProfile.showInDiscovery));
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    }
    loadPreferences();

    const handleAuthChange = () => {
      if (!isMounted) return;
      const p = authService.getProfile();
      if (p?.interestedIn) {
        if (Array.isArray(p.interestedIn)) setInterestedIn(p.interestedIn.map((s) => String(s).toLowerCase()));
        else if (typeof p.interestedIn === "string") setInterestedIn([p.interestedIn.toLowerCase()]);
      }
      if (p?.ageRange) {
        if (p.ageRange.min) setMinAge(p.ageRange.min);
        if (p.ageRange.max) setMaxAge(p.ageRange.max);
      }
      if (p?.maxDistance) setMaxDistance(p.maxDistance);
      if (p?.showInDiscovery !== undefined) setShowInDiscovery(Boolean(p.showInDiscovery));
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pj-auth-changed", handleAuthChange);
    };
  }, [profile]);

  const toggleInterestedIn = (key) => {
    setInterestedIn((prev) => {
      let current = Array.isArray(prev) ? [...prev] : [prev];
      if (key === "everyone") {
        if (current.includes("everyone") || (current.includes("men") && current.includes("women"))) {
          return ["women"];
        }
        return ["men", "women", "everyone"];
      }

      if (current.includes(key)) {
        const next = current.filter((k) => k !== key && k !== "everyone");
        return next.length > 0 ? next : [key];
      } else {
        const next = [...current.filter((k) => k !== "everyone"), key];
        if (next.includes("men") && next.includes("women")) {
          next.push("everyone");
        }
        return next;
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);

    try {
      await authService.updateProfile({
        interestedIn,
        ageRange: { min: parseInt(minAge, 10), max: parseInt(maxAge, 10) },
        maxDistance: parseInt(maxDistance, 10),
        showInDiscovery,
      });

      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Discovery preferences updated successfully!" });

      setTimeout(() => {
        router.push("/user/profile");
      }, 700);
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to save preferences" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="preferences" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-rose-500" />
              <span>Discovery Preferences</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Control who you see in your discover feed and how matches find you.
            </p>
          </div>

          {/* Interested In */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Show Me</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "women", label: "Women", emoji: "👩" },
                { id: "men", label: "Men", emoji: "👨" },
                { id: "everyone", label: "Everyone", emoji: "🌈" },
              ].map((item) => {
                const isChecked =
                  item.id === "everyone"
                    ? interestedIn.includes("everyone") ||
                      (interestedIn.includes("men") && interestedIn.includes("women"))
                    : interestedIn.includes(item.id);

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleInterestedIn(item.id)}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      isChecked
                        ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Range Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Age Preference
              </label>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Between {minAge} and {maxAge} years
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-zinc-400">Min Age: {minAge}</span>
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={minAge}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMinAge(Math.min(val, maxAge));
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-[11px] text-zinc-400">Max Age: {maxAge}</span>
                <input
                  type="range"
                  min="18"
                  max="70"
                  value={maxAge}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMaxAge(Math.max(val, minAge));
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Maximum Distance Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Maximum Distance</span>
              </label>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Within {maxDistance} km
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400">
              Only singles within this radius will appear on your discovery deck.
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-500" />
                <span>Show me on Prem Jodo Discovery</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Turn off if you want to take a break without deleting your profile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showInDiscovery}
              onChange={(e) => setShowInDiscovery(e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/user/profile"
              className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:opacity-95 transition-opacity flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Finish</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Column (Right - Desktop Only) */}
        <div className="hidden lg:block lg:col-span-5">
          <LiveProfileCardPreview
            profile={profile}
            user={user}
            liveData={{}}
          />
        </div>
      </div>
    </div>
  );
}
