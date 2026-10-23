"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Sparkles,
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

const DEFAULT_INTENTS = [
  { id: "long_term_partner", value: "long_term_partner", emoji: "💘", label: "Long-term partner", desc: "Looking for a committed, enduring relationship" },
  { id: "long_term_open_to_short", value: "long_term_open_to_short", emoji: "😍", label: "Long-term, open to short", desc: "Seeking serious partner, but flexible and open" },
  { id: "short_term_open_to_long", value: "short_term_open_to_long", emoji: "🥂", label: "Short-term, open to long", desc: "Looking for casual fun, open to long term if chemistry matches" },
  { id: "short_term_fun", value: "short_term_fun", emoji: "🎉", label: "Short-term fun", desc: "Casual dates, fun hangouts, and good times" },
  { id: "new_friends", value: "new_friends", emoji: "👋", label: "New friends", desc: "Expand your social network and meet like-minded people" },
  { id: "still_figuring_it_out", value: "still_figuring_it_out", emoji: "🤔", label: "Still figuring it out", desc: "Going with the flow and open to possibilities" },
];

export default function EditIntentPage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [intentOptions, setIntentOptions] = useState(DEFAULT_INTENTS);
  const [selectedIntent, setSelectedIntent] = useState("long_term_partner");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadIntent() {
      try {
        let activeProfile = authService.getProfile() || profile;

        if (!activeProfile || (!activeProfile.lookingFor && !activeProfile.relationshipIntent)) {
          const meData = await authService.getCurrentUser(true).catch(() => null);
          if (meData?.profile) activeProfile = meData.profile;
        }

        if (!isMounted) return;

        if (activeProfile?.lookingFor) setSelectedIntent(activeProfile.lookingFor);
        else if (activeProfile?.relationshipIntent) setSelectedIntent(activeProfile.relationshipIntent);

        const fetched = await authService.getLookingForOptions().catch(() => []);
        if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
          setIntentOptions(
            fetched.map((f) => ({
              ...f,
              id: f.value || f.id,
              desc: f.desc || f.description || "",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading intent:", err);
      }
    }
    loadIntent();

    const handleAuthChange = () => {
      if (!isMounted) return;
      const p = authService.getProfile();
      if (p?.lookingFor) setSelectedIntent(p.lookingFor);
      else if (p?.relationshipIntent) setSelectedIntent(p.relationshipIntent);
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pj-auth-changed", handleAuthChange);
    };
  }, [profile]);

  const handleSave = async (andNext = false) => {
    setIsSaving(true);
    setToastMessage(null);

    try {
      await authService.updateProfile({
        lookingFor: selectedIntent,
        relationshipIntent: selectedIntent,
      });

      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Relationship intent saved successfully!" });

      if (andNext) {
        setTimeout(() => {
          router.push("/user/profile/edit/interests");
        }, 500);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to update relationship intent" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="intent" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Relationship Intent</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Be upfront about what you are looking for so you match with people on the exact same wavelength.
            </p>
          </div>

          {/* Intent Cards Grid */}
          <div className="space-y-3">
            {intentOptions.map((opt) => {
              const isSelected = selectedIntent === opt.id || selectedIntent === opt.value;

              return (
                <button
                  type="button"
                  key={opt.id || opt.value}
                  onClick={() => setSelectedIntent(opt.id || opt.value)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-rose-50/80 dark:bg-rose-950/50 border-rose-500 shadow-sm ring-1 ring-rose-500/20"
                      : "bg-zinc-50/60 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-2xl flex-shrink-0 p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs border border-zinc-200/50 dark:border-zinc-800">
                      {opt.emoji || "💖"}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${
                          isSelected
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {opt.label || opt.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {opt.desc || opt.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-rose-500 text-white"
                        : "border border-zinc-300 dark:border-zinc-700 group-hover:border-rose-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
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
                <span>Save Intent</span>
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
              relationshipIntent: selectedIntent,
            }}
          />
        </div>
      </div>
    </div>
  );
}
