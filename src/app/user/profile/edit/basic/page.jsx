"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { EditSectionHeader } from "@/components/user/EditSectionHeader";
import { LiveProfileCardPreview } from "@/components/user/LiveProfileCardPreview";
import { FloatingToast } from "@/components/user/FloatingToast";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";

export default function EditBasicInfoPage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [birthMonth, setBirthMonth] = useState("01");
  const [birthDay, setBirthDay] = useState("01");
  const [birthYear, setBirthYear] = useState("2000");
  const [gender, setGender] = useState("male");
  const [showGender, setShowGender] = useState(true);
  const [interestedIn, setInterestedIn] = useState(["women"]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        let activeUser = authService.getUser() || user;
        let activeProfile = authService.getProfile() || profile;

        if (!activeProfile || (!activeProfile.birthday && !activeProfile.gender)) {
          const meData = await authService.getCurrentUser(true).catch(() => null);
          if (meData?.profile) activeProfile = meData.profile;
          if (meData?.user) activeUser = meData.user;
        }

        if (!isMounted) return;

        if (activeUser?.email) setEmail(activeUser.email);
        if (activeUser?.fullName) setFirstName(activeUser.fullName);
        else if (activeProfile?.fullName) setFirstName(activeProfile.fullName);

        if (activeProfile?.birthday) {
          if (typeof activeProfile.birthday === "object") {
            if (activeProfile.birthday.year) setBirthYear(String(activeProfile.birthday.year));
            if (activeProfile.birthday.month) setBirthMonth(String(activeProfile.birthday.month).padStart(2, "0"));
            if (activeProfile.birthday.day) setBirthDay(String(activeProfile.birthday.day).padStart(2, "0"));
          } else if (typeof activeProfile.birthday === "string") {
            const parts = activeProfile.birthday.split("-");
            if (parts[0]) setBirthYear(parts[0]);
            if (parts[1]) setBirthMonth(parts[1]);
            if (parts[2]) setBirthDay(parts[2]);
          }
        }

        if (activeProfile?.gender) setGender(activeProfile.gender.toLowerCase());
        if (activeProfile?.showGenderOnProfile !== undefined) {
          setShowGender(Boolean(activeProfile.showGenderOnProfile));
        }

        if (activeProfile?.interestedIn) {
          if (Array.isArray(activeProfile.interestedIn)) {
            setInterestedIn(activeProfile.interestedIn.map((s) => String(s).toLowerCase()));
          } else if (typeof activeProfile.interestedIn === "string") {
            setInterestedIn([activeProfile.interestedIn.toLowerCase()]);
          }
        }
      } catch (err) {
        console.error("Error loading basic info:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();

    const handleAuthChange = () => {
      if (!isMounted) return;
      const u = authService.getUser();
      const p = authService.getProfile();
      if (u?.email) setEmail(u.email);
      if (u?.fullName) setFirstName(u.fullName);
      else if (p?.fullName) setFirstName(p.fullName);
      if (p?.birthday) {
        if (typeof p.birthday === "object") {
          if (p.birthday.year) setBirthYear(String(p.birthday.year));
          if (p.birthday.month) setBirthMonth(String(p.birthday.month).padStart(2, "0"));
          if (p.birthday.day) setBirthDay(String(p.birthday.day).padStart(2, "0"));
        } else if (typeof p.birthday === "string") {
          const parts = p.birthday.split("-");
          if (parts[0]) setBirthYear(parts[0]);
          if (parts[1]) setBirthMonth(parts[1]);
          if (parts[2]) setBirthDay(parts[2]);
        }
      }
      if (p?.gender) setGender(p.gender.toLowerCase());
      if (p?.showGenderOnProfile !== undefined) setShowGender(Boolean(p.showGenderOnProfile));
      if (p?.interestedIn) {
        if (Array.isArray(p.interestedIn)) setInterestedIn(p.interestedIn.map((s) => String(s).toLowerCase()));
        else if (typeof p.interestedIn === "string") setInterestedIn([p.interestedIn.toLowerCase()]);
      }
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pj-auth-changed", handleAuthChange);
    };
  }, [user, profile]);

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

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) {
      errs.firstName = "Full Name is required";
    } else if (firstName.trim().length < 2) {
      errs.firstName = "Name must be at least 2 characters";
    }

    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    const y = parseInt(birthYear, 10);
    const currentYear = new Date().getFullYear();

    if (!m || isNaN(m) || m < 1 || m > 12) {
      errs.birthday = "Valid month required";
    } else if (!d || isNaN(d) || d < 1 || d > 31) {
      errs.birthday = "Valid day required";
    } else if (!y || isNaN(y) || y < 1920 || y > currentYear - 18) {
      errs.birthday = "You must be at least 18 years old";
    }

    if (!gender) {
      errs.gender = "Please select your gender";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (andNext = false) => {
    if (!validate()) return;
    setIsSaving(true);
    setToastMessage(null);

    try {
      const payload = {
        fullName: firstName.trim(),
        name: firstName.trim(),
        gender,
        showGenderOnProfile: showGender,
        interestedIn,
        birthday: {
          year: parseInt(birthYear, 10),
          month: parseInt(birthMonth, 10),
          day: parseInt(birthDay, 10),
        },
      };

      await authService.updateProfile(payload);
      if (typeof syncAuth === "function") syncAuth(true);

      setToastMessage({ type: "success", text: "Basic information saved successfully!" });

      if (andNext) {
        setTimeout(() => {
          router.push("/user/profile/edit/photos");
        }, 500);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to update basic info" });
    } finally {
      setIsSaving(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = [
    { value: "01", label: "01 - January" },
    { value: "02", label: "02 - February" },
    { value: "03", label: "03 - March" },
    { value: "04", label: "04 - April" },
    { value: "05", label: "05 - May" },
    { value: "06", label: "06 - June" },
    { value: "07", label: "07 - July" },
    { value: "08", label: "08 - August" },
    { value: "09", label: "09 - September" },
    { value: "10", label: "10 - October" },
    { value: "11", label: "11 - November" },
    { value: "12", label: "12 - December" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => String(currentYear - 18 - i));

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="basic" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" />
              <span>Basic Information</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your name and age help potential matches get to know the authentic you.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: null }));
              }}
              placeholder="e.g. Sagar Sharma"
              className={`w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                errors.firstName
                  ? "border-rose-500 focus:ring-rose-500/20"
                  : "border-zinc-200 dark:border-zinc-700 focus:border-rose-500 focus:ring-rose-500/10"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.firstName}</span>
              </p>
            )}
          </div>

          {/* Birthday Selectors */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Day */}
              <div>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.birthday && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.birthday}</span>
              </p>
            )}
            <p className="text-[11px] text-zinc-400">
              Your age is publicly shown on your discovery card based on your birth year.
            </p>
          </div>

          {/* Gender Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Gender <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: "male", label: "Man", emoji: "👨" },
                { id: "female", label: "Woman", emoji: "👩" },
                { id: "other", label: "Other", emoji: "✨" },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`p-2.5 sm:p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all whitespace-nowrap ${
                    gender === g.id
                      ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-base sm:text-lg">{g.emoji}</span>
                  <span className="truncate">{g.label}</span>
                </button>
              ))}
            </div>

            {/* Show Gender Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 mt-2">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Show gender on my profile
                </p>
                <p className="text-[11px] text-zinc-400">
                  Allows other singles to see your gender badge
                </p>
              </div>
              <input
                type="checkbox"
                checked={showGender}
                onChange={(e) => setShowGender(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Interested In (Orientation) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              I am Interested In
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                    className={`p-2.5 sm:p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all whitespace-nowrap ${
                      isChecked
                        ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                    }`}
                  >
                    <span className="text-base sm:text-lg">{item.emoji}</span>
                    <span className="truncate">{item.label}</span>
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
                <span>Save Changes</span>
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
              firstName,
              birthYear,
              gender,
            }}
          />
        </div>
      </div>
    </div>
  );
}
