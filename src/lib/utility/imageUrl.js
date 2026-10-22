/**
 * Image URL Resolver for Prem Jodo Frontend
 * Uses NEXT_PUBLIC_IMAGE_BASE_URL / NEXT_IMAGE_BASE_URL / NEXT_PUBLIC_SOCKET_URL from env.
 * Automatically prepends backend host to relative uploaded paths (/uploads/...).
 * No dummy placeholder images are inserted.
 */

/**
 * Get the base URL for uploaded images from environment variables.
 * @returns {string}
 */
export function getImageBaseUrl() {
  const envUrl =
    process.env.NEXT_IMAGE_BASE_URL ||
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "") : "") ||
    "";

  return envUrl ? envUrl.replace(/\/+$/, "") : "";
}

/**
 * Resolve any image path or URL.
 * If relative (e.g. /uploads/...), prepends image base URL from env.
 * Returns empty string or fallback if no valid image is provided.
 *
 * @param {string|Object|null|undefined} imgInput
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function resolveImageUrl(imgInput, fallback = "") {
  if (!imgInput) return fallback;

  let rawUrl = "";
  if (typeof imgInput === "string") {
    rawUrl = imgInput.trim();
  } else if (typeof imgInput === "object") {
    rawUrl =
      imgInput.url ||
      imgInput.fileUrl ||
      imgInput.path ||
      imgInput.secure_url ||
      imgInput.src ||
      imgInput.photo ||
      imgInput.avatar ||
      "";
    rawUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";
  }

  if (!rawUrl) return fallback;

  // If already absolute URL or data/blob URI
  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }

  // Handle protocol-relative URL (e.g. //res.cloudinary.com/...)
  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  // Relative path - prepend image base URL from env
  const base = getImageBaseUrl();
  const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Extract primary photo from user or profile object without dummy fallback.
 * Checks photos array, photo, avatar, faceVerification across all nested fields.
 *
 * @param {Object} userOrProfile
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function extractPrimaryPhoto(userOrProfile, fallback = "") {
  if (!userOrProfile) return fallback;

  const profile = userOrProfile.profile || userOrProfile;
  const user = userOrProfile.user || userOrProfile;

  // 1. Check photos array (direct, on profile, or on user)
  const photosArray =
    (Array.isArray(userOrProfile?.photos) && userOrProfile.photos) ||
    (Array.isArray(profile?.photos) && profile.photos) ||
    (Array.isArray(user?.photos) && user.photos);

  if (photosArray && photosArray.length > 0) {
    const primaryObj =
      photosArray.find((p) => (typeof p === "object" ? p?.isPrimary : false)) ||
      photosArray[0];
    const resolved = resolveImageUrl(primaryObj, "");
    if (resolved) return resolved;
  }

  // 2. Check photo string (direct, on profile, or on user)
  const singlePhoto = userOrProfile?.photo || profile?.photo || user?.photo;
  if (singlePhoto) {
    const resolved = resolveImageUrl(singlePhoto, "");
    if (resolved) return resolved;
  }

  // 3. Check avatar string (direct, on profile, or on user)
  const singleAvatar = userOrProfile?.avatar || profile?.avatar || user?.avatar;
  if (singleAvatar) {
    const resolved = resolveImageUrl(singleAvatar, "");
    if (resolved) return resolved;
  }

  // 4. Check faceVerification photo
  const facePhoto =
    userOrProfile?.faceVerification ||
    profile?.faceVerification ||
    user?.faceVerification;
  if (facePhoto) {
    const resolved = resolveImageUrl(facePhoto, "");
    if (resolved) return resolved;
  }

  return fallback;
}

/**
 * Strip backend host / base URL from image URL to send clean relative path (/uploads/...) to API.
 * @param {string|Object} imgInput
 * @returns {string}
 */
export function stripImageBaseUrl(imgInput) {
  if (!imgInput) return "";
  let raw = "";
  if (typeof imgInput === "string") {
    raw = imgInput.trim();
  } else if (typeof imgInput === "object") {
    raw = imgInput.url || imgInput.path || "";
    raw = typeof raw === "string" ? raw.trim() : "";
  }

  if (!raw || raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const base = getImageBaseUrl();
  let clean = raw;
  if (base && clean.startsWith(base)) {
    clean = clean.slice(base.length);
  } else {
    clean = clean.replace(/^https?:\/\/[^\/]+/i, "");
  }

  return clean.startsWith("/") ? clean : `/${clean}`;
}

export default resolveImageUrl;
