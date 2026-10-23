"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Star,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import { EditSectionHeader } from "@/components/user/EditSectionHeader";
import { LiveProfileCardPreview } from "@/components/user/LiveProfileCardPreview";
import { FloatingToast } from "@/components/user/FloatingToast";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";
import { resolveImageUrl, stripImageBaseUrl } from "@/lib/utility/imageUrl";

export default function EditPhotosPage() {
  const router = useRouter();
  const { user, profile, syncAuth } = useAuth();

  const [photoSlots, setPhotoSlots] = useState([
    { id: 0, url: "", photoId: null, rawUrl: "", isPrimary: true },
    { id: 1, url: "", photoId: null, rawUrl: "", isPrimary: false },
    { id: 2, url: "", photoId: null, rawUrl: "", isPrimary: false },
    { id: 3, url: "", photoId: null, rawUrl: "", isPrimary: false },
    { id: 4, url: "", photoId: null, rawUrl: "", isPrimary: false },
    { id: 5, url: "", photoId: null, rawUrl: "", isPrimary: false },
  ]);

  const [uploadingSlotId, setUploadingSlotId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;
    async function loadPhotos() {
      try {
        let activeProfile = authService.getProfile() || profile;
        let activeUser = authService.getUser() || user;

        if (!activeProfile || (!activeProfile.photos?.length && !activeUser?.photos?.length)) {
          const meData = await authService.getCurrentUser(true).catch(() => null);
          if (meData?.profile) activeProfile = meData.profile;
          if (meData?.user) activeUser = meData.user;
        }

        if (!isMounted) return;

        const photosList =
          (Array.isArray(activeProfile?.photos) && activeProfile.photos) ||
          (Array.isArray(activeUser?.photos) && activeUser.photos) ||
          [];

        const newSlots = Array.from({ length: 6 }, (_, idx) => {
          const item = photosList[idx];
          if (item) {
            const rawUrl = typeof item === "string" ? item : item.url || item.secure_url || "";
            const photoId = typeof item === "object" ? item._id || item.id || null : null;
            const isPrimary = typeof item === "object" ? Boolean(item.isPrimary) : idx === 0;
            return {
              id: idx,
              url: resolveImageUrl(rawUrl),
              rawUrl,
              photoId,
              isPrimary: isPrimary || idx === 0,
            };
          }
          return { id: idx, url: "", rawUrl: "", photoId: null, isPrimary: idx === 0 };
        });

        // Ensure at least one primary is set
        if (!newSlots.some((s) => s.isPrimary && s.url)) {
          const firstFilled = newSlots.find((s) => s.url);
          if (firstFilled) firstFilled.isPrimary = true;
          else newSlots[0].isPrimary = true;
        }

        setPhotoSlots(newSlots);
      } catch (err) {
        console.error("Error loading photos:", err);
      }
    }
    loadPhotos();

    const handleAuthChange = () => {
      if (!isMounted) return;
      const p = authService.getProfile();
      const u = authService.getUser();
      const photosList =
        (Array.isArray(p?.photos) && p.photos) ||
        (Array.isArray(u?.photos) && u.photos) ||
        [];

      const newSlots = Array.from({ length: 6 }, (_, idx) => {
        const item = photosList[idx];
        if (item) {
          const rawUrl = typeof item === "string" ? item : item.url || item.secure_url || "";
          const photoId = typeof item === "object" ? item._id || item.id || null : null;
          const isPrimary = typeof item === "object" ? Boolean(item.isPrimary) : idx === 0;
          return {
            id: idx,
            url: resolveImageUrl(rawUrl),
            rawUrl,
            photoId,
            isPrimary: isPrimary || idx === 0,
          };
        }
        return { id: idx, url: "", rawUrl: "", photoId: null, isPrimary: idx === 0 };
      });

      if (!newSlots.some((s) => s.isPrimary && s.url)) {
        const firstFilled = newSlots.find((s) => s.url);
        if (firstFilled) firstFilled.isPrimary = true;
        else newSlots[0].isPrimary = true;
      }
      setPhotoSlots(newSlots);
    };

    window.addEventListener("pj-auth-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pj-auth-changed", handleAuthChange);
    };
  }, [user, profile]);

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingSlotId(index);
    setToastMessage(null);

    try {
      // Direct upload through authService.uploadPhotos
      const uploadRes = await authService.uploadPhotos([file]);
      if (typeof syncAuth === "function") syncAuth(true);

      const photosList =
        (Array.isArray(uploadRes?.photos) && uploadRes.photos) ||
        (Array.isArray(uploadRes?.profile?.photos) && uploadRes.profile.photos) ||
        (Array.isArray(uploadRes?.data?.photos) && uploadRes.data.photos) ||
        (Array.isArray(authService.getProfile()?.photos) && authService.getProfile().photos) ||
        [];

      if (photosList.length > 0) {
        setPhotoSlots((prev) =>
          Array.from({ length: 6 }, (_, idx) => {
            const item = photosList[idx];
            if (item) {
              const rawUrl = typeof item === "string" ? item : item.url || item.secure_url || "";
              const photoId = typeof item === "object" ? item._id || item.id || null : null;
              const isPrimary = typeof item === "object" ? Boolean(item.isPrimary) : idx === 0;
              return {
                id: idx,
                url: resolveImageUrl(rawUrl),
                rawUrl,
                photoId,
                isPrimary: isPrimary || idx === 0,
              };
            }
            return prev[idx] || { id: idx, url: "", rawUrl: "", photoId: null, isPrimary: idx === 0 };
          })
        );
      } else {
        // Fallback local file reader for instant preview
        const reader = new FileReader();
        reader.onload = () => {
          setPhotoSlots((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              url: reader.result,
              rawUrl: reader.result,
              isPrimary: index === 0 || !next.some((s) => s.isPrimary && s.url),
            };
            return next;
          });
        };
        reader.readAsDataURL(file);
      }

      setToastMessage({ type: "success", text: "Photo uploaded successfully!" });
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to upload photo" });
    } finally {
      setUploadingSlotId(null);
    }
  };

  const handleSetPrimary = async (index) => {
    const slot = photoSlots[index];
    if (!slot.url) return;

    setPhotoSlots((prev) =>
      prev.map((s, idx) => ({
        ...s,
        isPrimary: idx === index,
      }))
    );

    if (slot.photoId) {
      try {
        await authService.setPrimaryPhoto(slot.photoId);
        if (typeof syncAuth === "function") syncAuth(true);
      } catch {}
    }
  };

  const handleDeletePhoto = async (index) => {
    const slot = photoSlots[index];
    if (!slot.url) return;

    setPhotoSlots((prev) => {
      const next = [...prev];
      next[index] = { id: index, url: "", rawUrl: "", photoId: null, isPrimary: false };
      if (slot.isPrimary) {
        const nextFilled = next.find((s) => s.url);
        if (nextFilled) nextFilled.isPrimary = true;
      }
      return next;
    });

    try {
      const rawUrl = slot.rawUrl || slot.url;
      await authService.deletePhoto({
        photoId: slot.photoId || undefined,
        photoUrl: rawUrl || undefined,
      });
      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Photo deleted successfully!" });
    } catch (err) {
      console.warn("Delete photo error:", err);
      setToastMessage({ type: "error", text: err?.message || "Failed to delete photo" });
    }
  };

  const handleSave = async (andNext = false) => {
    setIsSaving(true);
    setToastMessage(null);

    try {
      const filledPhotos = photoSlots.filter((s) => s.url);
      if (filledPhotos.length === 0) {
        setToastMessage({ type: "error", text: "Please upload at least 1 profile photo" });
        setIsSaving(false);
        return;
      }

      const primary = filledPhotos.find((s) => s.isPrimary) || filledPhotos[0];

      await authService.updateProfile({
        photo: stripImageBaseUrl(primary.rawUrl || primary.url),
        avatar: stripImageBaseUrl(primary.rawUrl || primary.url),
      });

      if (typeof syncAuth === "function") syncAuth(true);
      setToastMessage({ type: "success", text: "Photos saved successfully!" });

      if (andNext) {
        setTimeout(() => {
          router.push("/user/profile/edit/intent");
        }, 500);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: err?.message || "Failed to save photos" });
    } finally {
      setIsSaving(false);
    }
  };

  const primarySlot = photoSlots.find((s) => s.isPrimary && s.url) || photoSlots.find((s) => s.url);

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <EditSectionHeader currentSectionId="photos" />

      <FloatingToast toast={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" />
              <span>Photos & Media</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Add up to 6 photos. The photo with the star badge will be your main discovery cover.
            </p>
          </div>

          {/* 6 Photo Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photoSlots.map((slot, index) => {
              const isUploading = uploadingSlotId === index;

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (!slot.url && !isUploading) {
                      fileInputRefs.current[index]?.click();
                    }
                  }}
                  className={`aspect-[3/4] rounded-2xl relative overflow-hidden border-2 transition-all flex flex-col justify-end p-2 group cursor-pointer ${
                    slot.isPrimary && slot.url
                      ? "border-rose-500 ring-2 ring-rose-500/20 bg-zinc-900"
                      : slot.url
                      ? "border-zinc-300 dark:border-zinc-700 bg-zinc-900"
                      : "border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:border-rose-400 hover:bg-rose-50/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(index, e.target.files[0]);
                      }
                    }}
                  />

                  {/* If slot has photo */}
                  {slot.url ? (
                    <>
                      <img
                        src={slot.url}
                        alt={`Photo slot ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Top Badges / Star */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                        {slot.isPrimary ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 fill-white" />
                            Main
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(index);
                            }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 hover:bg-rose-500 text-white flex items-center gap-1 backdrop-blur-xs transition-colors"
                          >
                            <Star className="w-3 h-3" />
                            Set Main
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(index);
                          }}
                          className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </>
                  ) : (
                    /* Empty Placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center space-y-2">
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                          <span className="text-[10px] text-zinc-400 font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 group-hover:scale-110 transition-all shadow-2xs">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                              Slot {index + 1}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {index === 0 ? "Main Cover Photo" : "Add Photo"}
                            </p>
                          </div>
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                              <Camera className="w-3 h-3" />
                              <span>Upload Photo</span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pro Photo Guidelines</span>
            </h4>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 list-disc list-inside">
              <li>High resolution portrait photos with good lighting get 4x more matches.</li>
              <li>Show your face clearly in the primary slot without heavy sunglasses or hats.</li>
              <li>Include a mix of close-ups, hobbies, and full-body moments.</li>
            </ul>
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
                <span>Save Photos</span>
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
              profilePhoto: primarySlot?.url || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
