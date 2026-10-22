"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { EditSectionHeader } from "@/components/user/EditSectionHeader";
import { LiveProfileCardPreview } from "@/components/user/LiveProfileCardPreview";
import { FloatingToast } from "@/components/user/FloatingToast";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

const RELIGION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Spiritual",
  "Atheist",
  "Other",
];

const EDUCATION_OPTIONS = [
  "High School / Secondary",
  "Diploma / Polytechnic",
  "B.Tech / B.E. (Engineering)",
  "BCA / B.Sc (Computer Science / IT)",
  "B.Sc (Science)",
  "B.Com / BBA (Commerce / Management)",
  "B.A (Arts / Humanities)",
  "Bachelor's Degree (Other)",
  "M.Tech / M.E. / MS",
  "MCA / M.Sc (IT)",
  "MBA / PGDM",
  "M.Sc (Science)",
  "M.Com / Master's (Commerce)",
  "M.A (Arts)",
  "Master's Degree (Other)",
  "MBBS / MD / Medical",
  "BDS / Dental",
  "LLB / LLM / Law",
  "CA / CS / ICWA / Finance",
  "Ph.D. / Doctorate",
  "Other",
];

const BIO_PROMPTS = [
  "Looking for someone who loves spontaneous coffee dates and good books.",
  "Tech enthusiast by day, amateur chef by night. Let's explore new food spots!",
  "Always down for road trips, live indie gigs, and deep late-night conversations.",
  "Passionate about fitness, startups, and making every moment count.",
];

export default function EditLifestylePage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [aboutMe, setAboutMe] = useState("");
  const [religion, setReligion] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    function loadLifestyle() {
      try {
        const activeProfile = authService.getProfile() || profile;

        if (activeProfile?.bio) setAboutMe(activeProfile.bio);
        else if (activeProfile?.aboutMe) setAboutMe(activeProfile.aboutMe);

        if (activeProfile?.religion) setReligion(activeProfile.religion);
        if (activeProfile?.education) setEducation(activeProfile.education);
        if (activeProfile?.occupation || activeProfile?.profession) {
          setOccupation(activeProfile.occupation || activeProfile.profession);
        }
      } catch (err) {
        console.error("Error loading lifestyle info:", err);
      }
    }
    loadLifestyle();
  }, [profile]);

  const validate = () => {
    const errs = {};
    if (!aboutMe.trim()) {
      errs.aboutMe = "Bio is required (minimum 10 characters)";
    } else if (aboutMe.trim().length < 10) {
      errs.aboutMe = "Bio must be at least 10 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (andNext = false) => {
    if (!validate()) return;
    setIsSaving(true);
    setToastMessage(null);

    try {
      await authService.updateProfile({
        bio: aboutMe.trim(),
        aboutMe: aboutMe.trim(),
        religion,
        education,
        occupation: occupation.trim(),
        profession: occupation.trim(),
      });

      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Bio & lifestyle saved successfully!" });

      if (andNext) {
        setTimeout(() => {
          router.push("/user/profile/edit/preferences");
        }, 500);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to update lifestyle details" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="lifestyle" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-500" />
              <span>Bio & Lifestyle Details</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your bio and lifestyle details are key conversation starters for singles viewing your card.
            </p>
          </div>

          {/* About Me / Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                About Me (Bio) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {aboutMe.length}/500 chars
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={500}
              value={aboutMe}
              onChange={(e) => {
                setAboutMe(e.target.value);
                if (errors.aboutMe) setErrors((prev) => ({ ...prev, aboutMe: null }));
              }}
              placeholder="Write a catchy, authentic introduction about yourself..."
              className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.aboutMe
                  ? "border-rose-500 focus:ring-rose-500/20"
                  : "border-zinc-200 dark:border-zinc-700 focus:border-rose-500 focus:ring-rose-500/10"
              }`}
            />
            {errors.aboutMe && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.aboutMe}</span>
              </p>
            )}

            {/* Quick Inspiration Bio Starters */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Bio Starters (Click to use)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BIO_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAboutMe(prompt)}
                    className="px-2.5 py-1 rounded-xl text-[11px] text-left bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-zinc-600 dark:text-zinc-300 transition-colors border border-transparent hover:border-rose-200"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Education Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-rose-500" />
              <span>Highest Education</span>
            </label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Select your education level</option>
              {EDUCATION_OPTIONS.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </select>
          </div>

          {/* Religion / Belief Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Religion / Belief</span>
            </label>
            <select
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Select religion / belief</option>
              {RELIGION_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation / Profession */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-rose-500" />
              <span>Profession / Job Title</span>
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, Product Designer, Entrepreneur"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-rose-500"
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />}
                <span>Save Details</span>
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
              aboutMe,
              education,
              religion,
            }}
          />
        </div>
      </div>
    </div>
  );
}
