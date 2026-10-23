import { apiFetch, getAccessToken as getStoredToken, setAccessToken, setUnauthorizedHandler, STORAGE_KEYS } from "./apiClient";

export { STORAGE_KEYS };

// In-memory runtime store (NEVER written to localStorage)
let inMemoryUser = null;
let inMemoryProfile = null;
let lookingForPromise = null;
let interestsPromise = null;
let currentUserPromise = null;
const userProfilePromises = new Map();

// Register unauthorized 401 response hook to clear in-memory session cache
setUnauthorizedHandler(() => {
  inMemoryUser = null;
  inMemoryProfile = null;
  currentUserPromise = null;
  userProfilePromises.clear();
});

// Helper to decode JWT payload safely in browser
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Automatic cleanup of legacy / non-token localStorage keys (e.g. pj_last_active_*, user, profile, matches)
export function cleanupDisallowedStorage() {
  if (typeof window === "undefined") return;
  const DISALLOWED_EXACT_KEYS = [
    "token",
    "accessToken",
    "access_token",
    "token_expiry",
    "pj_user",
    "pj_profile",
    "user",
    "profile",
    "premjodo_user_profile",
    "pj_matches_count",
    "ludo_wallet",
    "pj_wallet",
    "websdk_ng_config_restore_state",
    "websdk_ng_global_parameter",
    "websdk_ng_install_id",
  ];
  try {
    DISALLOWED_EXACT_KEYS.forEach((k) => localStorage.removeItem(k));

    // Dynamic prefix sweep for pj_last_active_*, last_active_*, pj_match_*, pj_chat_*
    const dynamicKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("pj_last_active") ||
          k.startsWith("last_active") ||
          k.startsWith("pj_match") ||
          k.startsWith("pj_chat") ||
          k.startsWith("pj_battle_"))
      ) {
        dynamicKeysToRemove.push(k);
      }
    }
    dynamicKeysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch { }
}

// Run initial cleanup immediately on script execution
if (typeof window !== "undefined") {
  cleanupDisallowedStorage();
}

export const authService = {
  /**
   * Request an OTP for the provided email address
   * Endpoint: POST /auth/send-otp
   */
  async sendOtp(email) {
    try {
      const response = await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to send OTP (${response.status})`);
      }

      return data;
    } catch (error) {
      console.warn("sendOtp note:", error?.message || error);
      throw error;
    }
  },

  /**
   * Verify the 6-digit OTP received on email
   * Endpoint: POST /auth/verify-otp
   */
  async verifyOtp(email, otp) {
    try {
      const response = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          otp: String(otp).trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to verify OTP (${response.status})`);
      }

      // Automatically persist tokens & user profile
      if (data?.data || data) {
        authService.saveSession(data.data || data);
      }

      return data;
    } catch (error) {
      console.warn("verifyOtp note:", error?.message || error);
      throw error;
    }
  },

  /**
   * Authenticate via Google OAuth
   * Endpoint: POST /auth/google
   * @param {Object} payload - { credential, idToken, email, googleId, name, avatar }
   */
  async googleLogin(payload) {
    try {
      const response = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Google login failed (${response.status})`);
      }

      if (data?.data || data) {
        authService.saveSession(data.data || data);
      }

      return data;
    } catch (error) {
      console.warn("googleLogin note:", error?.message || error);
      throw error;
    }
  },

  /**
   * Save accessToken, refreshToken, tokenExpiry to localStorage and user/profile in-memory only
   */
  saveSession(authData) {
    if (typeof window === "undefined" || !authData) return;

    // Clean up any prohibited keys first
    cleanupDisallowedStorage();

    const nestedData = authData.data || authData;

    const token =
      nestedData.accessToken ||
      nestedData.token ||
      nestedData.access_token ||
      nestedData.tokens?.accessToken ||
      nestedData.tokens?.token ||
      nestedData.tokens?.access_token ||
      nestedData.user?.accessToken ||
      nestedData.user?.token ||
      authData.accessToken ||
      authData.token ||
      authData.access_token ||
      authData.tokens?.accessToken ||
      authData.tokens?.token ||
      authData.user?.accessToken ||
      authData.user?.token;

    const refreshToken =
      nestedData.refreshToken ||
      nestedData.refresh_token ||
      nestedData.tokens?.refreshToken ||
      nestedData.tokens?.refresh_token ||
      authData.refreshToken ||
      authData.refresh_token ||
      authData.tokens?.refreshToken;

    if (token) {
      setAccessToken(token);

      // Compute and store token expiry date (pj_token_expiry only)
      const cleanToken = token;
      const payload = parseJwtPayload(cleanToken);
      let expiryDate = nestedData.expiresAt || nestedData.expiryDate || nestedData.tokenExpiry || authData.expiresAt;
      if (!expiryDate && payload?.exp) {
        expiryDate = new Date(payload.exp * 1000).toISOString();
      }
      if (!expiryDate) {
        // Fallback default: 7 days
        expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryDate);
      localStorage.removeItem("token_expiry");
    }

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    const rawUser = nestedData.user || authData.user;
    const resolvedIsOnboarded =
      typeof nestedData.isOnboarded === "boolean"
        ? nestedData.isOnboarded
        : typeof authData.isOnboarded === "boolean"
          ? authData.isOnboarded
          : typeof rawUser?.isOnboarded === "boolean"
            ? rawUser.isOnboarded
            : null;

    const resolvedIsFaceVerified =
      typeof nestedData.isFaceVerification === "boolean"
        ? nestedData.isFaceVerification
        : typeof nestedData.isFaceVerified === "boolean"
          ? nestedData.isFaceVerified
          : typeof authData.isFaceVerification === "boolean"
            ? authData.isFaceVerification
            : typeof authData.isFaceVerified === "boolean"
              ? authData.isFaceVerified
              : typeof rawUser?.isFaceVerification === "boolean"
                ? rawUser.isFaceVerification
                : typeof rawUser?.isFaceVerified === "boolean"
                  ? rawUser.isFaceVerified
                  : null;

    if (resolvedIsOnboarded !== null && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, String(resolvedIsOnboarded));
      } catch { }
    }

    if (resolvedIsFaceVerified !== null && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.IS_FACE_VERIFIED, String(resolvedIsFaceVerified));
      } catch { }
    }

    if (rawUser) {
      const u = {
        ...rawUser,
        ...(resolvedIsOnboarded !== null ? { isOnboarded: resolvedIsOnboarded } : {}),
        ...(resolvedIsFaceVerified !== null
          ? { isFaceVerification: resolvedIsFaceVerified, isFaceVerified: resolvedIsFaceVerified }
          : {}),
      };
      inMemoryUser = u;
    } else if (token) {
      // Decode user from JWT if not explicitly provided in response
      const payload = parseJwtPayload(token);
      if (payload) {
        const uId = payload._id || payload.id || payload.userId;
        if (uId) {
          const fallbackName = payload.fullName || payload.name || "";
          const userObj = {
            _id: uId,
            id: uId,
            email: payload.email || "",
            fullName: fallbackName,
            name: fallbackName,
            isOnboarded:
              resolvedIsOnboarded !== null
                ? resolvedIsOnboarded
                : Boolean(payload.isOnboarded),
            isFaceVerification:
              resolvedIsFaceVerified !== null
                ? resolvedIsFaceVerified
                : Boolean(payload.isFaceVerification ?? payload.isFaceVerified),
            isFaceVerified:
              resolvedIsFaceVerified !== null
                ? resolvedIsFaceVerified
                : Boolean(payload.isFaceVerification ?? payload.isFaceVerified),
            avatar: payload.avatar || "",
          };
          inMemoryUser = userObj;
        }
      }
    }

    const rawProfile = nestedData.profile || authData.profile;
    if (rawProfile) {
      inMemoryProfile = rawProfile;
    }

    try {
      window.dispatchEvent(new Event("pj-auth-changed"));
    } catch {
      // ignore
    }
  },

  /**
   * Get user object from in-memory runtime store or decoded JWT token payload
   */
  getUser() {
    if (inMemoryUser) return inMemoryUser;

    const token = authService.getAccessToken();
    if (!token) return null;

    const payload = parseJwtPayload(token);
    if (payload) {
      const uId = payload._id || payload.id || payload.userId;
      if (uId) {
        const fallbackName = payload.fullName || payload.name || "";
        let storedOnboarded = null;
        let storedFaceVerified = null;
        if (typeof window !== "undefined") {
          try {
            storedOnboarded = localStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
            storedFaceVerified = localStorage.getItem(STORAGE_KEYS.IS_FACE_VERIFIED);
          } catch { }
        }
        const resolvedOnboarded =
          storedOnboarded !== null
            ? storedOnboarded === "true"
            : Boolean(payload.isOnboarded);

        const resolvedFaceVerified =
          storedFaceVerified !== null
            ? storedFaceVerified === "true"
            : Boolean(payload.isFaceVerification ?? payload.isFaceVerified);

        const userObj = {
          _id: uId,
          id: uId,
          email: payload.email || "",
          fullName: fallbackName,
          name: fallbackName,
          avatar: payload.avatar || "",
          isOnboarded: resolvedOnboarded,
          isFaceVerification: resolvedFaceVerified,
          isFaceVerified: resolvedFaceVerified,
        };
        inMemoryUser = userObj;
        return userObj;
      }
    }
    return null;
  },

  /**
   * Set user in-memory only
   * @param {Object} userData
   * @param {boolean} [notify=true] - Whether to dispatch pj-auth-changed event
   */
  setUser(userData, notify = true) {
    inMemoryUser = userData;
    if (typeof window !== "undefined" && notify) {
      try {
        window.dispatchEvent(new Event("pj-auth-changed"));
      } catch { }
    }
  },

  /**
   * Get profile object from in-memory store only
   * (NEVER reads from localStorage)
   */
  getProfile() {
    return inMemoryProfile;
  },

  /**
   * Set profile in-memory only
   * @param {Object} profileData
   * @param {boolean} [notify=true] - Whether to dispatch pj-auth-changed event
   */
  setProfile(profileData, notify = true) {
    inMemoryProfile = profileData;
    if (typeof window !== "undefined" && notify) {
      try {
        window.dispatchEvent(new Event("pj-auth-changed"));
      } catch { }
    }
  },

  /**
   * Get stored Access Token
   */
  getAccessToken() {
    return getStoredToken();
  },

  /**
   * Get stored Refresh Token
   */
  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get stored Token Expiry Date
   */
  getTokenExpiry() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  },

  /**
   * Log out user from backend and clear local session
   * Endpoint: POST /auth/logout
   */
  async logout() {
    try {
      if (authService.isAuthenticated()) {
        await apiFetch("/auth/logout", {
          method: "POST",
        }).catch((err) => {
          console.warn("Backend logout note:", err?.message || err);
        });
      }
    } catch (error) {
      console.warn("Logout error:", error?.message || error);
    } finally {
      authService.clearSession();
    }
  },

  /**
   * Clear all auth session data (Logout)
   */
  clearSession() {
    setAccessToken(null);
    inMemoryUser = null;
    inMemoryProfile = null;
    currentUserPromise = null;
    userProfilePromises.clear();

    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.IS_ONBOARDED);
    localStorage.removeItem(STORAGE_KEYS.IS_FACE_VERIFIED);
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("isOnboarded");
    localStorage.removeItem("is_onboarded");
    localStorage.removeItem("isFaceVerification");
    localStorage.removeItem("isFaceVerified");

    cleanupDisallowedStorage();

    try {
      window.dispatchEvent(new Event("pj-auth-changed"));
    } catch {
      // ignore
    }
  },

  /**
   * Check if active user is face verified
   */
  isFaceVerified() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_FACE_VERIFIED);
      if (stored !== null) return stored === "true";
    }
    const u = inMemoryUser;
    if (u?.isFaceVerification !== undefined) return Boolean(u.isFaceVerification);
    if (u?.isFaceVerified !== undefined) return Boolean(u.isFaceVerified);
    return false;
  },

  /**
   * Check if active user is onboarded
   */
  isOnboarded() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
      if (stored !== null) return stored === "true";
    }
    const u = inMemoryUser;
    if (u?.isOnboarded !== undefined) return Boolean(u.isOnboarded);
    return false;
  },

  /**
   * Submit user onboarding data
   * Endpoint: POST /auth/onboarding (fallback /onboarding, /users/onboarding)
   * Supports JSON payload or FormData (for multipart photo uploads)
   */
  async completeOnboarding(onboardingPayload) {
    try {
      const candidateEndpoints = [
        "/auth/onboarding",
      ];

      let lastError = null;
      let response = null;
      let data = null;

      const isFormData = onboardingPayload instanceof FormData;

      for (const endpoint of candidateEndpoints) {
        try {
          response = await apiFetch(endpoint, {
            method: "POST",
            body: isFormData ? onboardingPayload : JSON.stringify(onboardingPayload),
          });

          if (response.status === 404) {
            continue;
          }

          data = await response.json().catch(() => ({}));
          break;
        } catch (err) {
          lastError = err;
          if (err?.message?.includes("Cannot connect")) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to contact onboarding endpoint");
      }

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Onboarding failed (${response.status})`);
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, "true");
        } catch { }
      }

      if (data?.data) {
        authService.saveSession(data.data);
      }

      return data;
    } catch (error) {
      console.warn("completeOnboarding note:", error?.message || error);
      throw error;
    }
  },

  /**
   * Fetch Looking-for relationship intent options
   * Endpoint: GET /users/looking-for-options
   */
  async getLookingForOptions() {
    if (lookingForPromise) return lookingForPromise;

    lookingForPromise = (async () => {
      try {
        const response = await apiFetch("/users/looking-for-options");
        if (!response.ok) return [];
        const data = await response.json().catch(() => ({}));
        if (data?.success === false) return [];
        return Array.isArray(data?.data) ? data.data : [];
      } catch (error) {
        lookingForPromise = null;
        console.warn("getLookingForOptions note:", error?.message || error);
        return [];
      }
    })();

    return lookingForPromise;
  },

  /**
   * Fetch available interest tags
   * Endpoint: GET /users/interests
   */
  async getInterests() {
    if (interestsPromise) return interestsPromise;

    interestsPromise = (async () => {
      try {
        const response = await apiFetch("/users/interests");
        if (!response.ok) return [];
        const data = await response.json().catch(() => ({}));
        if (data?.success === false) return [];
        return Array.isArray(data?.data) ? data.data : [];
      } catch (error) {
        interestsPromise = null;
        console.warn("getInterests note:", error?.message || error);
        return [];
      }
    })();

    return interestsPromise;
  },

  /**
   * Fetch current authenticated user & profile
   * Endpoint: GET /auth/me
   */
  async getCurrentUser(force = false) {
    if (!authService.isAuthenticated()) {
      currentUserPromise = null;
      return null;
    }

    if (currentUserPromise && !force) {
      return currentUserPromise;
    }

    currentUserPromise = (async () => {
      try {
        const response = await apiFetch("/auth/me", {
          method: "GET",
        });

        if (response.status === 401) {
          currentUserPromise = null;
          return null;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false) {
          currentUserPromise = null;
          return null;
        }

        const meData = data?.data || data || {};
        const rawUser = meData.user || (meData.email || meData._id ? meData : null);
        let rawProfile = meData.profile || (meData.photos || meData.bio || meData.birthday || meData.gender || meData.lookingFor || meData.interests ? meData : null);

        // Fallback: If user was returned but profile object wasn't included directly, attempt to fetch user's full profile
        if ((!rawProfile || (!rawProfile.photos?.length && !rawProfile.bio && !rawProfile.interests?.length)) && rawUser?._id) {
          try {
            const profRes = await apiFetch(`/users/profile/${rawUser._id}`, { method: "GET" }).catch(() => null);
            if (profRes && profRes.ok) {
              const profData = await profRes.json().catch(() => ({}));
              if (profData?.data || profData?.profile) {
                rawProfile = profData.data || profData.profile;
              }
            }
          } catch { }
        }

        const isOnboarded = meData.isOnboarded ?? rawUser?.isOnboarded ?? rawProfile?.isOnboarded;
        const isFaceVerified =
          meData.isFaceVerification ??
          meData.isFaceVerified ??
          rawUser?.isFaceVerification ??
          rawUser?.isFaceVerified ??
          rawProfile?.isFaceVerification ??
          rawProfile?.isFaceVerified;

        const storedOnboarded =
          typeof window !== "undefined"
            ? localStorage.getItem(STORAGE_KEYS.IS_ONBOARDED)
            : null;
        const storedFaceVerified =
          typeof window !== "undefined"
            ? localStorage.getItem(STORAGE_KEYS.IS_FACE_VERIFIED)
            : null;

        if (rawUser) {
          const isUserOnboarded =
            typeof isOnboarded === "boolean"
              ? isOnboarded
              : typeof rawUser.isOnboarded === "boolean"
                ? rawUser.isOnboarded
                : typeof rawProfile?.isOnboarded === "boolean"
                  ? rawProfile.isOnboarded
                  : storedOnboarded !== null
                    ? storedOnboarded === "true"
                    : Boolean(rawProfile?.birthday || rawProfile?.gender || (Array.isArray(rawProfile?.photos) && rawProfile.photos.length > 0));

          const isUserFaceVerified =
            typeof isFaceVerified === "boolean"
              ? isFaceVerified
              : typeof rawUser.isFaceVerification === "boolean"
                ? rawUser.isFaceVerification
                : typeof rawUser.isFaceVerified === "boolean"
                  ? rawUser.isFaceVerified
                  : typeof rawProfile?.isFaceVerification === "boolean"
                    ? rawProfile.isFaceVerification
                    : typeof rawProfile?.isFaceVerified === "boolean"
                      ? rawProfile.isFaceVerified
                      : storedFaceVerified !== null
                        ? storedFaceVerified === "true"
                        : false;

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, String(isUserOnboarded));
              localStorage.setItem(STORAGE_KEYS.IS_FACE_VERIFIED, String(isUserFaceVerified));
            } catch { }
          }

          const resolvedVip =
            meData.vipBadge ??
            rawUser?.vipBadge ??
            rawProfile?.vipBadge ??
            meData.isVip ??
            rawUser?.isVip ??
            rawProfile?.isVip ??
            meData.subscription?.vipBadge ??
            rawUser?.subscription?.vipBadge ??
            rawProfile?.subscription?.vipBadge;

          const updatedUser = {
            ...rawUser,
            isOnboarded: isUserOnboarded,
            isFaceVerification: isUserFaceVerified,
            isFaceVerified: isUserFaceVerified,
            ...(resolvedVip !== undefined ? { vipBadge: resolvedVip, isVip: Boolean(resolvedVip) } : {}),
          };
          authService.setUser(updatedUser, true);
          meData.user = updatedUser;
        }

        if (rawProfile) {
          const resolvedVip =
            meData.vipBadge ??
            rawUser?.vipBadge ??
            rawProfile?.vipBadge ??
            meData.isVip ??
            rawUser?.isVip ??
            rawProfile?.isVip;
          if (resolvedVip !== undefined) {
            rawProfile.vipBadge = resolvedVip;
            rawProfile.isVip = Boolean(resolvedVip);
          }
          authService.setProfile(rawProfile, true);
          meData.profile = rawProfile;
        }

        return meData;
      } catch (error) {
        currentUserPromise = null;
        console.warn("getCurrentUser note:", error?.message || error);
        return null;
      } finally {
        setTimeout(() => {
          currentUserPromise = null;
        }, 500);
      }
    })();

    return currentUserPromise;
  },

  /**
   * Alias for getCurrentUser
   */
  async getMe(force = false) {
    return authService.getCurrentUser(force);
  },

  /**
   * Fetch user profile by userId
   * Endpoint: GET /users/profile/:userId (or GET /auth/me for current user)
   */
  async getUserProfile(userId) {
    const storedUser = authService.getUser();
    const currentUserId = storedUser?._id || storedUser?.id || storedUser?.userId;
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return authService.getProfile();
    }

    // If fetching for current authenticated user, use /auth/me
    if (!userId || userId === currentUserId) {
      const me = await authService.getCurrentUser();
      if (me?.profile) return me.profile;
    }

    if (userProfilePromises.has(targetUserId)) {
      return userProfilePromises.get(targetUserId);
    }

    const fetchPromise = (async () => {
      try {
        const response = await apiFetch(`/users/profile/${targetUserId}`, {
          method: "GET",
        });

        if (response.status === 404) {
          // User exists but has not created a profile yet
          return authService.getProfile();
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false) {
          if (response.status === 404 || data?.message?.toLowerCase().includes("not found")) {
            return authService.getProfile();
          }
          console.warn("getUserProfile note:", data?.message || response.status);
          return authService.getProfile();
        }

        const profileData = data?.data || data;

        if (profileData) {
          authService.setProfile(profileData);
          const currentU = authService.getUser();
          if (currentU && (profileData.fullName || profileData.name || profileData.user?.fullName)) {
            const pName = profileData.fullName || profileData.name || profileData.user?.fullName;
            authService.setUser({
              ...currentU,
              fullName: pName,
              name: pName,
            });
          }
        }

        return profileData;
      } catch (error) {
        userProfilePromises.delete(targetUserId);
        console.warn("getUserProfile note:", error?.message || error);
        return authService.getProfile();
      }
    })();

    userProfilePromises.set(targetUserId, fetchPromise);
    return fetchPromise;
  },

  /**
   * Update/Upsert user profile
   * Endpoint: PUT /users/profile
   */
  async updateProfile(profilePayload) {
    try {
      const isFormData = profilePayload instanceof FormData;
      const response = await apiFetch("/users/profile", {
        method: "PUT",
        body: isFormData ? profilePayload : JSON.stringify(profilePayload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to update profile (${response.status})`);
      }

      const updatedProfile = data?.data || data;

      if (updatedProfile) {
        authService.setProfile(updatedProfile);
        const currentU = authService.getUser();
        if (currentU) {
          const pName = updatedProfile.fullName || updatedProfile.name || updatedProfile.user?.fullName || currentU.fullName;
          const pPhotos = updatedProfile.photos || updatedProfile.profile?.photos || currentU.photos;
          authService.setUser({
            ...currentU,
            fullName: pName,
            name: pName,
            ...(pPhotos ? { photos: pPhotos } : {}),
            ...(updatedProfile.avatar ? { avatar: updatedProfile.avatar } : {}),
            ...(updatedProfile.photo ? { photo: updatedProfile.photo } : {}),
          });
        }
      }

      userProfilePromises.clear();
      return updatedProfile;
    } catch (error) {
      console.warn("updateProfile note:", error?.message || error);
      throw error;
    }
  },

  /**
   * Upload multiple photos
   * Endpoint: POST /users/photos
   * Form-Data field: 'photos' (multiple files)
   * @param {File[]|FileList|File|FormData} files
   */
  async uploadPhotos(files) {
    try {
      let formData;
      if (files instanceof FormData) {
        formData = files;
      } else {
        formData = new FormData();
        const fileList = Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files];
        fileList.forEach((f) => {
          if (f instanceof File || f instanceof Blob) {
            formData.append("photos", f, f.name || "photo.jpg");
          }
        });
      }

      const response = await apiFetch("/users/photos", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Photo upload failed (${response.status})`);
      }

      const resData = data?.data || data;
      const updatedProfile = resData?.profile || resData;

      if (updatedProfile) {
        authService.setProfile(updatedProfile);
        const currentU = authService.getUser();
        if (currentU) {
          const pPhotos = updatedProfile.photos || updatedProfile.profile?.photos || currentU.photos;
          authService.setUser({
            ...currentU,
            ...(pPhotos ? { photos: pPhotos } : {}),
          });
        }
      }

      userProfilePromises.clear();
      return resData;
    } catch (error) {
      console.warn("uploadPhotos error:", error?.message || error);
      throw error;
    }
  },


  /**
   * Delete photo by photoId or photoUrl
   * Endpoint: DELETE /users/photos
   * @param {Object|string} payload - { photoId, photoUrl } or id/url string
   */
  async deletePhoto(payload) {
    try {
      let photoId = "";
      let photoUrl = "";

      if (typeof payload === "string") {
        if (payload.startsWith("http") || payload.startsWith("/uploads") || payload.includes("/") || payload.includes(".")) {
          photoUrl = payload;
        } else {
          photoId = payload;
        }
      } else if (typeof payload === "object" && payload !== null) {
        photoId = payload.photoId || payload.id || payload._id || "";
        photoUrl = payload.photoUrl || payload.url || payload.rawUrl || "";
      }

      const bodyPayload = {};
      if (photoId) bodyPayload.photoId = String(photoId);
      if (photoUrl) bodyPayload.photoUrl = String(photoUrl);

      const response = await apiFetch("/users/photos", {
        method: "DELETE",
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to delete photo (${response.status})`);
      }

      const resData = data?.data || data;
      const updatedProfile = resData?.profile || resData;

      if (updatedProfile) {
        authService.setProfile(updatedProfile);
        const currentU = authService.getUser();
        if (currentU) {
          const pPhotos = updatedProfile.photos || updatedProfile.profile?.photos || currentU.photos;
          authService.setUser({
            ...currentU,
            ...(pPhotos ? { photos: pPhotos } : {}),
          });
        }
      }

      userProfilePromises.clear();
      return resData;
    } catch (error) {
      console.warn("deletePhoto error:", error?.message || error);
      throw error;
    }
  },

  /**
   * Upload face verification image to backend API
   * Endpoint: POST /users/face-verification (fallback to /auth/face-verification, /face-verification)
   * Form-Data field: 'image'
   * @param {File|Blob|string|FormData} imageInput
   * @returns {Promise<Object>}
   */
  async uploadFaceVerification(imageInput) {
    try {
      let formData;
      if (imageInput instanceof FormData) {
        formData = imageInput;
      } else {
        formData = new FormData();
        let fileObj = imageInput;
        if (typeof imageInput === "string" && imageInput.startsWith("data:")) {
          const blob = dataUrlToBlob(imageInput);
          fileObj = new File([blob], "face_verification.jpg", {
            type: blob?.type || "image/jpeg",
          });
        }
        formData.append("image", fileObj, "face_verification.jpg");
      }

      // Try routes in order of standard backend mount hierarchy
      const candidateEndpoints = [
        "/users/face-verification",
      ];

      let lastError = null;
      let response = null;
      let data = null;

      for (const endpoint of candidateEndpoints) {
        try {
          response = await apiFetch(endpoint, {
            method: "POST",
            body: formData,
          });

          // If endpoint is 404, try next candidate
          if (response.status === 404) {
            continue;
          }

          data = await response.json().catch(() => ({}));
          break;
        } catch (err) {
          lastError = err;
          if (err?.message?.includes("Cannot connect")) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to contact face verification endpoint");
      }

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Face verification upload failed (${response.status})`);
      }

      // Update in-memory user and profile flags if present
      const currentUser = authService.getUser();
      if (currentUser) {
        authService.setUser({
          ...currentUser,
          isFaceVerification: true,
          isVerified: true,
        });
      }

      const currentProfile = authService.getProfile();
      if (currentProfile) {
        authService.setProfile({
          ...currentProfile,
          isFaceVerification: true,
          isVerified: true,
          faceVerification: data?.data?.faceVerification || currentProfile.faceVerification,
        });
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("pj_is_face_verified", "true");
        } catch { }
      }

      return data;
    } catch (error) {
      console.warn("uploadFaceVerification error:", error?.message || error);
      throw error;
    }
  },

  /**
   * Check whether user has an active session token
   */
  isAuthenticated() {
    return Boolean(authService.getAccessToken());
  },
};

/**
 * Convert base64 data URL to Blob safely in browser
 * @param {string} dataUrl
 * @returns {Blob|null}
 */
function dataUrlToBlob(dataUrl) {
  if (typeof window === "undefined" || !dataUrl || typeof dataUrl !== "string") return null;
  try {
    const parts = dataUrl.split(",");
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.warn("dataUrlToBlob parsing error:", err);
    return null;
  }
}

export default authService;
