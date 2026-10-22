"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageModal } from "@/components/common/LanguageModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";
import { resolveImageUrl, stripImageBaseUrl, extractPrimaryPhoto } from "@/lib/utility/imageUrl";
import { CustomSelect } from "@/components/reusable/CustomSelect";
import { LanguageIcon } from "@/components/common/LanguageIcon";
import {
  Camera,
  Upload,
  X,
  Plus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

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

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { t, language, supportedLanguages } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef(null);

  // Dynamic Options purely from API
  const [lookingForOptions, setLookingForOptions] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);

  // Form State - Empty by default
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState(""); // 'male' | 'female' | 'other'
  const [showGender, setShowGender] = useState(true);
  const [interestedIn, setInterestedIn] = useState(["women"]); // Multi-select array e.g. ['men', 'women'] or ['women']
  const [lookingFor, setLookingFor] = useState("");
  const [tempIntent, setTempIntent] = useState("");
  const [religion, setReligion] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);

  // Location Coordinates State ([longitude, latitude])
  const [coordinates, setCoordinates] = useState([0, 0]);

  console.log("coordinates", coordinates)

  // Request browser geolocation on mount in background
  useEffect(() => {
    if (typeof window !== "undefined" && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (typeof lat === "number" && typeof lng === "number") {
            // GeoJSON Point format: [longitude, latitude]
            setCoordinates([lng, lat]);
          }
        },
        (err) => {
          console.warn("Geolocation skipped/denied:", err?.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // 6 photo slots state
  const [photoSlots, setPhotoSlots] = useState([
    { id: 0, url: "", photoId: null, rawUrl: "", file: null, isPrimary: true },
    { id: 1, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
    { id: 2, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
    { id: 3, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
    { id: 4, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
    { id: 5, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
  ]);
  const [uploadingSlots, setUploadingSlots] = useState([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [deletingPhotoIndex, setDeletingPhotoIndex] = useState(null);
  const fileInputRefs = useRef([]);
  const bulkPhotoInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  const buildPhotoSlotsFromProfile = (photosList) => {
    const slots = Array(6).fill(null).map((_, i) => ({
      id: i,
      photoId: null,
      rawUrl: "",
      url: "",
      file: null,
      isPrimary: i === 0,
    }));
    if (Array.isArray(photosList) && photosList.length > 0) {
      photosList.slice(0, 6).forEach((p, idx) => {
        const resolved = resolveImageUrl(p);
        if (resolved) {
          slots[idx] = {
            id: idx,
            photoId: typeof p === "object" ? (p._id || p.id || null) : null,
            rawUrl: typeof p === "object" ? (p.url || "") : (typeof p === "string" ? p : ""),
            url: resolved,
            file: null,
            isPrimary: typeof p === "object" && p.isPrimary !== undefined ? Boolean(p.isPrimary) : idx === 0,
          };
        }
      });
    }
    return slots;
  };

  // Route protection: require face verification before onboarding, and redirect to /user if already onboarded
  useEffect(() => {
    if (!isLoading) {
      const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("pj_access_token"));
      if (!isAuthenticated && !hasToken) {
        router.replace("/");
        return;
      }

      const storedFaceVerified = typeof window !== "undefined" ? localStorage.getItem("pj_is_face_verified") : null;
      const isUserFaceVerified =
        user?.isFaceVerification !== undefined
          ? user.isFaceVerification
          : user?.isFaceVerified !== undefined
          ? user.isFaceVerified
          : storedFaceVerified !== null
          ? storedFaceVerified === "true"
          : null;

      // 1. Must be face verified to do onboarding
      if (isUserFaceVerified === false || storedFaceVerified === "false") {
        router.replace("/verify-face");
        return;
      }

      // 2. If already onboarded, go to user dashboard
      const storedOnboarded = typeof window !== "undefined" ? localStorage.getItem("pj_is_onboarded") : null;
      if (user?.isOnboarded === true || storedOnboarded === "true") {
        router.replace("/user");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Sync logged in email & existing photos if any
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.fullName) {
      setFullName(user.fullName);
    }
    const initialProfile = authService.getProfile();
    const existingPhotos =
      (Array.isArray(initialProfile?.photos) && initialProfile.photos.length > 0 && initialProfile.photos) ||
      (Array.isArray(user?.photos) && user.photos.length > 0 && user.photos) ||
      [];
    if (existingPhotos.length > 0) {
      setPhotoSlots(buildPhotoSlotsFromProfile(existingPhotos));
    } else if (user?.avatar) {
      const av = resolveImageUrl(user.avatar);
      if (av) {
        setPhotoSlots([
          { id: 0, url: av, photoId: null, rawUrl: user.avatar, file: null, isPrimary: true },
          { id: 1, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
          { id: 2, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
          { id: 3, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
          { id: 4, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
          { id: 5, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false },
        ]);
      }
    }
  }, [user]);

  const hasLoadedOptionsRef = useRef(false);

  // Fetch dynamic looking-for and interest options once
  useEffect(() => {
    if (hasLoadedOptionsRef.current) return;
    hasLoadedOptionsRef.current = true;

    async function loadOptions() {
      try {
        const [intents, tags] = await Promise.all([
          authService.getLookingForOptions(),
          authService.getInterests(),
        ]);
        if (Array.isArray(intents) && intents.length > 0) {
          setLookingForOptions(intents);
        }
        if (Array.isArray(tags) && tags.length > 0) {
          setAvailableInterests(tags);
        }
      } catch (err) {
        console.warn("Error fetching onboarding options:", err);
      }
    }
    loadOptions();
  }, []);

  const currentLangObj =
    supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSlotUpload = async (index, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let targetIndices = [];
    if (index !== null && index !== undefined) {
      for (let i = 0; i < files.length; i++) {
        if (index + i < 6) targetIndices.push(index + i);
      }
    } else {
      const emptyIndices = photoSlots
        .map((s, idx) => (!s.url ? idx : null))
        .filter((idx) => idx !== null);
      targetIndices = emptyIndices.slice(0, files.length);
    }
    if (targetIndices.length === 0) targetIndices = [0];

    setUploadingSlots(targetIndices);
    setIsUploadingPhotos(true);
    try {
      const res = await authService.uploadPhotos(files);
      const updatedProfile = res?.profile || res?.data?.profile || authService.getProfile();

      if (Array.isArray(updatedProfile?.photos) && updatedProfile.photos.length > 0) {
        const newSlots = buildPhotoSlotsFromProfile(updatedProfile.photos);
        setPhotoSlots(newSlots);
      } else if (Array.isArray(res?.addedPhotos) && res.addedPhotos.length > 0) {
        const me = await authService.getCurrentUser(true);
        if (me?.profile?.photos) {
          const newSlots = buildPhotoSlotsFromProfile(me.profile.photos);
          setPhotoSlots(newSlots);
        }
      }
      if (errors.photo) setErrors((prev) => ({ ...prev, photo: null }));
    } catch (err) {
      console.error("Photo upload error:", err);
      setErrors((prev) => ({ ...prev, photo: err?.message || "Failed to upload photo" }));
    } finally {
      setUploadingSlots([]);
      setIsUploadingPhotos(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveSlot = async (index) => {
    const targetSlot = photoSlots[index];
    if (!targetSlot?.url) return;

    const photoId = targetSlot.photoId || null;
    const photoUrl = targetSlot.rawUrl || stripImageBaseUrl(targetSlot.url) || targetSlot.url;

    setDeletingPhotoIndex(index);
    try {
      const res = await authService.deletePhoto({ photoId, photoUrl });
      const updatedProfile = res?.profile || res?.data?.profile || authService.getProfile();

      if (Array.isArray(updatedProfile?.photos)) {
        const newSlots = buildPhotoSlotsFromProfile(updatedProfile.photos);
        setPhotoSlots(newSlots);
      } else {
        const me = await authService.getCurrentUser(true);
        if (me?.profile?.photos) {
          const newSlots = buildPhotoSlotsFromProfile(me.profile.photos);
          setPhotoSlots(newSlots);
        } else {
          setPhotoSlots((prev) => {
            const next = [...prev];
            next[index] = { id: index, url: "", photoId: null, rawUrl: "", file: null, isPrimary: false };
            return next;
          });
        }
      }
    } catch (err) {
      console.error("Photo delete error:", err);
      setErrors((prev) => ({ ...prev, photo: err?.message || "Failed to delete photo" }));
    } finally {
      setDeletingPhotoIndex(null);
    }
  };

  const toggleInterestedIn = (key) => {
    setInterestedIn((prev) => {
      let current = Array.isArray(prev) ? [...prev] : prev ? [prev] : [];
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
    if (errors.interestedIn) setErrors((prev) => ({ ...prev, interestedIn: null }));
  };

  const toggleInterest = (val) => {
    if (interests.includes(val)) {
      setInterests(interests.filter((i) => i !== val));
    } else {
      if (interests.length < 7) {
        setInterests([...interests, val]);
        if (errors.interests) setErrors((prev) => ({ ...prev, interests: null }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim() || fullName.trim().length > 50) {
      newErrors.fullName = "Please enter your full name (1 - 50 characters).";
    }

    const dayNum = parseInt(birthDay, 10);
    const monthNum = parseInt(birthMonth, 10);
    const yearNum = parseInt(birthYear, 10);
    const currentYear = new Date().getFullYear();

    if (
      !dayNum ||
      dayNum < 1 ||
      dayNum > 31 ||
      !monthNum ||
      monthNum < 1 ||
      monthNum > 12 ||
      !yearNum ||
      yearNum < 1920 ||
      currentYear - yearNum < 18
    ) {
      newErrors.birthday = "You must be at least 18 years old to join Prem Jodo.";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender.";
    }

    if (!interestedIn || (Array.isArray(interestedIn) && interestedIn.length === 0)) {
      newErrors.interestedIn = "Please select who you are interested in.";
    }

    if (!lookingFor) {
      newErrors.lookingFor = "Please select what you are looking for.";
    }

    const hasAtLeastOnePhoto = photoSlots.some((slot) => Boolean(slot.url));
    if (!hasAtLeastOnePhoto) {
      newErrors.photo = "Please upload at least 1 profile picture to complete your profile.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    const activeSlots = photoSlots.filter((slot) => Boolean(slot.url));
    const cleanInterestedIn = Array.isArray(interestedIn)
      ? interestedIn.map((i) => String(i).toLowerCase())
      : [String(interestedIn || "women").toLowerCase()];

    const bYear = parseInt(birthYear, 10);
    const bMonth = parseInt(birthMonth, 10);
    const bDay = parseInt(birthDay, 10);
    const parsedDob = new Date(bYear, bMonth - 1, bDay);

    const submissionPayload = {
      fullName: fullName.trim(),
      gender: gender.toLowerCase(),
      showGenderOnProfile: Boolean(showGender),
      birthday: {
        year: bYear,
        month: bMonth,
        day: bDay,
      },
      dateOfBirth: parsedDob.toISOString(),
      interestedIn: cleanInterestedIn,
      interests: interests,
      lookingFor: lookingFor || "Long-term partner",
      religion: religion.trim() || "",
      education: education.trim() || "",
      bio: bio.trim(),
      aboutMe: bio.trim(),
      location: {
        type: "Point",
        coordinates:
          Array.isArray(coordinates) && coordinates.length === 2
            ? [Number(coordinates[0]), Number(coordinates[1])]
            : [0, 0],
      },
      photos: activeSlots.map((slot, idx) => ({
        url: slot.rawUrl || stripImageBaseUrl(slot.url) || slot.url,
        isPrimary: slot.isPrimary ?? idx === 0,
      })),
    };

    try {
      await authService.completeOnboarding(submissionPayload);

      const primaryPhotoUrl = activeSlots[0]?.url || "";

      // Save local backup for instant preview
      try {
        const profileData = {
          name: `${fullName}, ${new Date().getFullYear() - parseInt(birthYear || "1999", 10)}`,
          firstName: fullName,
          email,
          birthday: `${birthYear}-${birthMonth}-${birthDay}`,
          gender,
          showGender,
          interestedIn,
          relationshipIntent: lookingFor,
          religion,
          education,
          aboutMe: bio,
          interests,
          location: {
            type: "Point",
            coordinates:
              Array.isArray(coordinates) && coordinates.length === 2
                ? [Number(coordinates[0]), Number(coordinates[1])]
                : [0, 0],
          },
          photo: primaryPhotoUrl,
          photos: activeSlots.map((slot, idx) => ({
            url: slot.url,
            isPrimary: slot.isPrimary ?? idx === 0,
          })),
        };
        authService.setProfile(profileData);
      } catch { }

      setIsSubmitting(false);
      router.push("/user");
    } catch (err) {
      console.error("Onboarding submit failed:", err);
      setIsSubmitting(false);
      setServerError(err?.message || "Failed to complete onboarding. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectedIntentObj =
    lookingForOptions.find((i) => i.label === lookingFor || i.value === lookingFor) || null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
        <div className="container h-20 flex items-center justify-between">
          <Logo size="md" href="/" />

          <div className="flex items-center gap-2.5 sm:gap-4">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsLangOpen(true)}
              className="flex items-center py-2 transition-colors duration-200 whitespace-nowrap text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
            >
              <span className="whitespace-nowrap">
                {t("nav.language", "Language")}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Profile Form */}
      <main className="flex-1 py-10 sm:py-16">
        <div className="container">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            {serverError && (
              <div className="mb-8 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-sm poppins-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{serverError}</span>
                </div>
                {(serverError.toLowerCase().includes("face") ||
                  serverError.toLowerCase().includes("verification")) && (
                    <button
                      type="button"
                      onClick={() => router.push("/verify-face")}
                      className="shrink-0 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs poppins-bold transition-all shadow-md cursor-pointer"
                    >
                      Verify Face Now &rarr;
                    </button>
                  )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left Column: Essential Profile Fields */}
              <div className="lg:col-span-7 space-y-7">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-900/90 border ${errors.fullName
                      ? "border-rose-500 text-rose-600 dark:text-rose-200 focus:ring-2 focus:ring-rose-500"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-rose-500"
                      } text-sm poppins-medium focus:outline-none transition-all`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email (Read-only / verified) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] poppins-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={email}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm poppins-medium focus:outline-none cursor-not-allowed select-none transition-all"
                  />
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Birthday <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 poppins-medium">Month</span>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="MM"
                        value={birthMonth}
                        onChange={(e) => {
                          setBirthMonth(e.target.value);
                          if (errors.birthday) setErrors({ ...errors, birthday: null });
                        }}
                        className="w-full text-center py-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-sm poppins-bold text-zinc-900 dark:text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 poppins-medium">Day</span>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="DD"
                        value={birthDay}
                        onChange={(e) => {
                          setBirthDay(e.target.value);
                          if (errors.birthday) setErrors({ ...errors, birthday: null });
                        }}
                        className="w-full text-center py-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-sm poppins-bold text-zinc-900 dark:text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 poppins-medium">Year</span>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="YYYY"
                        value={birthYear}
                        onChange={(e) => {
                          setBirthYear(e.target.value);
                          if (errors.birthday) setErrors({ ...errors, birthday: null });
                        }}
                        className="w-full text-center py-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-sm poppins-bold text-zinc-900 dark:text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {errors.birthday && (
                    <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.birthday}</span>
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2.5">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "male", label: "Male" },
                      { key: "female", label: "Female" },
                      { key: "other", label: "Other" },
                    ].map((g) => {
                      const isSelected = gender === g.key;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => {
                            setGender(g.key);
                            if (errors.gender) setErrors({ ...errors, gender: null });
                          }}
                          className={`flex-1 min-w-[100px] py-3 px-4 rounded-2xl text-xs sm:text-sm poppins-semibold border transition-all cursor-pointer ${isSelected
                            ? "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/10 font-bold"
                            : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.gender && (
                    <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.gender}</span>
                    </p>
                  )}

                  <label className="inline-flex items-center gap-2.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showGender}
                      onChange={(e) => setShowGender(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>Show my gender on my profile</span>
                  </label>
                </div>

                {/* Interested in */}
                <div className="space-y-2.5">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Interested in <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "men", label: "Men" },
                      { key: "women", label: "Women" },
                      { key: "everyone", label: "Everyone" },
                    ].map((item) => {
                      const isSelected = Array.isArray(interestedIn)
                        ? interestedIn.includes(item.key)
                        : interestedIn === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleInterestedIn(item.key)}
                          className={`flex-1 min-w-[100px] py-3 px-4 rounded-2xl text-xs sm:text-sm poppins-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isSelected
                            ? "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/10 font-bold"
                            : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.interestedIn && (
                    <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.interestedIn}</span>
                    </p>
                  )}
                </div>

                {/* Looking for (Relationship Intent) */}
                <div className="space-y-2.5">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Looking for <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempIntent(lookingFor);
                        setIsIntentModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs poppins-semibold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>{lookingFor ? "Change Relationship Intent" : "Select Relationship Intent"}</span>
                    </button>

                    {selectedIntentObj ? (
                      <div>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs poppins-bold shadow-sm">
                          <span>{selectedIntentObj.emoji}</span>
                          <span>{selectedIntentObj.label}</span>
                        </span>
                      </div>
                    ) : (
                      errors.lookingFor && (
                        <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.lookingFor}</span>
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Religion & Education (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Religion (CustomSelect) */}
                  <div className="space-y-2">
                    <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">Religion</label>
                    <CustomSelect
                      options={RELIGION_OPTIONS.map((rel) => ({
                        value: rel,
                        label: rel,
                      }))}
                      value={religion}
                      onChange={(val) => setReligion(val)}
                      placeholder="Select Religion (Optional)"
                      size="lg"
                      className="!rounded-2xl !py-3.5"
                    />
                  </div>

                  {/* Education (CustomSelect) */}
                  <div className="space-y-2">
                    <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">Education</label>
                    <CustomSelect
                      options={EDUCATION_OPTIONS.map((edu) => ({
                        value: edu,
                        label: edu,
                      }))}
                      value={education}
                      onChange={(val) => {
                        setEducation(val);
                        if (errors.education) setErrors({ ...errors, education: null });
                      }}
                      placeholder="Select Education (Optional)"
                      size="lg"
                      className="!rounded-2xl !py-3.5"
                    />
                    {errors.education && (
                      <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.education}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2 pt-2">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">Bio</label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your matches a little about your passions, vibe, and what makes you smile..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs sm:text-sm poppins-regular focus:border-rose-500 focus:outline-none transition-all resize-none leading-relaxed"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Authentic bios get 4x more replies</span>
                    <span>{bio.length}/500</span>
                  </div>
                </div>

                {/* Interests Tag Cloud */}
                <div className="space-y-2.5">
                  <label className="block text-sm poppins-bold text-zinc-800 dark:text-zinc-200">
                    Interests <span className="text-xs text-zinc-500 font-normal">(Select up to 7)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableInterests.map((item) => {
                      const itemVal = item.value || item.label?.toLowerCase();
                      const isSelected = interests.includes(itemVal);
                      return (
                        <button
                          key={itemVal}
                          type="button"
                          onClick={() => toggleInterest(itemVal)}
                          className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${isSelected
                            ? "bg-rose-500 text-white border-rose-500 font-bold shadow-sm shadow-rose-500/30"
                            : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                          {isSelected ? `✓ ${item.label}` : item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Photos Grid (6 Slots) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="block text-sm poppins-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      PROFILE PHOTOS <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Upload up to 6 photos. Slot 1 will be your primary photo.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs">
                      {photoSlots.filter((s) => s.url).length} / 6
                    </span>
                  </div>
                </div>

                {/* 6 Photo Cards Grid (3 Columns x 2 Rows) */}
                <div className="grid grid-cols-3 gap-3 sm:gap-3.5">
                  {photoSlots.map((slot, index) => {
                    const isSlotDeleting = deletingPhotoIndex === index;
                    const isSlotUploading = uploadingSlots.includes(index);
                    return (
                      <div
                        key={slot.id}
                        className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all duration-200 group ${slot.url
                          ? "border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-900 shadow-sm dark:shadow-lg"
                          : "border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer"
                          } ${errors.photo && !photoSlots.some((s) => s.url) ? "border-rose-500/80 ring-1 ring-rose-500/40" : ""}`}
                        onClick={() => {
                          if (!slot.url && uploadingSlots.length === 0) {
                            fileInputRefs.current[index]?.click();
                          }
                        }}
                      >
                        <input
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSlotUpload(index, e)}
                        />

                        {slot.url ? (
                          <>
                            <img
                              src={slot.url}
                              alt={`Profile Photo ${index + 1}`}
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-40 group-hover:opacity-70 transition-opacity" />

                            {/* Main badge for slot 0 */}
                            {(slot.isPrimary || index === 0) && (
                              <div className="absolute top-2 left-2 z-10">
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md">
                                  Main
                                </span>
                              </div>
                            )}

                            {/* Cross Delete Button (No edit pencil button) */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSlot(index);
                                }}
                                disabled={isSlotDeleting || isSlotUploading}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/65 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md border border-white/20 disabled:opacity-50"
                                title="Delete photo"
                              >
                                {isSlotDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                ) : (
                                  <X className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Empty slot placeholder */}
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                              {isSlotUploading ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                                  <span className="text-[10px] text-zinc-500 font-medium">Uploading...</span>
                                </div>
                              ) : (
                                <>
                                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-1 text-zinc-500 dark:text-zinc-400 group-hover:bg-rose-50 dark:group-hover:bg-rose-500/20 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors shadow-xs">
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                  </div>
                                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-rose-500 transition-colors">
                                    Add Photo
                                  </span>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {errors.photo && (
                  <p className="text-xs text-rose-500 poppins-medium flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.photo}</span>
                  </p>
                )}

                {/* Member Safety Note */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1 shadow-xs">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Verified Photo Safety
                  </p>
                  <p className="text-[11px]">
                    Your photo will be protected by biometric identity verification to prevent fake profiles on Prem Jodo.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col items-center gap-4 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-md py-4 px-8 rounded-full text-base poppins-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:opacity-95 shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Completing Profile...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/" prefetch={false} className="text-rose-500 dark:text-rose-400 hover:underline poppins-semibold">
                  Log in.
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Relationship Intent Selection Modal */}
      {isIntentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsIntentModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-xl sm:text-2xl poppins-black tracking-tight text-zinc-900 dark:text-white">
                What are you looking for?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All good if it changes. There&apos;s something for everyone.
              </p>
            </div>

            {/* Grid Intent Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {lookingForOptions.map((item) => {
                const itemKey = item.label || item.value;
                const isSelected = tempIntent === itemKey;
                return (
                  <button
                    key={item.value || item.label}
                    type="button"
                    onClick={() => setTempIntent(itemKey)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer aspect-square ${isSelected
                      ? "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 shadow-md ring-1 ring-rose-500 scale-[1.02]"
                      : "bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                  >
                    <span className="text-2xl mb-1.5">{item.emoji || "✨"}</span>
                    <span className="text-[11px] poppins-semibold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setLookingFor(tempIntent);
                if (errors.lookingFor) setErrors((prev) => ({ ...prev, lookingFor: null }));
                setIsIntentModalOpen(false);
              }}
              className="w-full py-3.5 rounded-full text-sm poppins-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md active:scale-95 cursor-pointer font-extrabold"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
}
