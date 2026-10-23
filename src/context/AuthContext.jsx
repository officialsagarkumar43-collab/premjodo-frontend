"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import authService from "@/lib/services/auth.service";
import membershipService from "@/lib/services/membership.service";
import socketService from "@/lib/services/socket.service";

const AuthContext = createContext({
  user: null,
  profile: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  googleLogin: async () => {},
  getCurrentUser: async () => {},
  getMe: async () => {},
  logout: () => {},
  refreshSession: () => {},
  refreshSubscription: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchedMeUserRef = useRef(null);
  const fetchedSubUserRef = useRef(null);

  const refreshSubscription = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setSubscription(null);
      return null;
    }
    try {
      const sub = await membershipService.getMySubscription();
      if (sub) {
        setSubscription(sub);
      }
      return sub;
    } catch (err) {
      console.warn("[AuthContext] Failed to refresh subscription via /membership/my-subscription:", err);
      return null;
    }
  }, []);

  const syncAuth = useCallback(async (force = false) => {
    try {
      const isAuth = authService.isAuthenticated();
      const currentUser = authService.getUser();
      const currentProfile = authService.getProfile();
      const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId || (isAuth ? "auth_user" : null);

      if (currentUser) setUser(currentUser);
      if (currentProfile) setProfile(currentProfile);
      setIsAuthenticated(isAuth);

      if (isAuth) {
        // Concurrently fetch /auth/me and /membership/my-subscription upfront on page load
        const promises = [];
        const hasFullProfile = Boolean(
          currentProfile &&
          (currentProfile.bio || currentProfile.photos?.length || currentProfile.birthday || currentProfile.interests?.length)
        );

        if (force || fetchedMeUserRef.current !== currentUserId || !hasFullProfile) {
          promises.push(
            authService
              .getCurrentUser(force)
              .then((meData) => {
                if (meData) {
                  fetchedMeUserRef.current = currentUserId;
                  const resolvedUser =
                    meData.user ||
                    (meData.email || meData._id ? meData : null) ||
                    authService.getUser();
                  const resolvedProfile =
                    meData.profile ||
                    (meData.photos || meData.bio || meData.birthday || meData.gender || meData.lookingFor || meData.interests ? meData : null) ||
                    authService.getProfile();

                  if (resolvedUser) setUser(resolvedUser);
                  if (resolvedProfile) setProfile(resolvedProfile);

                  // Cache user avatar in sessionStorage for instant loading animation display on reload
                  if (typeof window !== "undefined") {
                    try {
                      const photoUrl =
                        resolvedProfile?.photos?.[0]?.url ||
                        resolvedProfile?.photos?.[0] ||
                        resolvedProfile?.photo ||
                        resolvedUser?.avatar ||
                        resolvedUser?.photo;
                      if (photoUrl) {
                        sessionStorage.setItem("pj_user_avatar", typeof photoUrl === "string" ? photoUrl : photoUrl?.url || "");
                      }
                    } catch {}
                  }
                } else {
                  // If fetch failed, allow subsequent syncAuth calls to retry
                  fetchedMeUserRef.current = null;
                }
              })
              .catch(() => {
                fetchedMeUserRef.current = null;
              })
          );
        }

        if (force || fetchedSubUserRef.current !== currentUserId) {
          promises.push(
            membershipService
              .getMySubscription()
              .then((subData) => {
                if (subData) {
                  fetchedSubUserRef.current = currentUserId;
                  setSubscription(subData);
                } else {
                  fetchedSubUserRef.current = null;
                }
              })
              .catch(() => {
                fetchedSubUserRef.current = null;
              })
          );
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } else {
        fetchedMeUserRef.current = null;
        fetchedSubUserRef.current = null;
        setSubscription(null);
      }
    } catch (err) {
      console.error("Auth sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncAuth();

    const handleAuthChange = () => {
      const u = authService.getUser();
      const p = authService.getProfile();
      if (u) setUser(u);
      if (p) setProfile(p);
    };

    const handleFocus = () => {
      if (authService.isAuthenticated()) {
        const p = authService.getProfile();
        if (!p || (!p.bio && !p.photos?.length)) {
          syncAuth(true);
        }
      }
    };

    // Real-time listener for socket membership/subscription quota updates
    const unsubMembership = socketService.onMembershipUpdated((data) => {
      if (data?.subscription) {
        setSubscription((prev) => ({
          ...(prev || {}),
          ...(data.subscription || {}),
          swipesUsedToday:
            data.swipesUsedToday ??
            data.subscription?.swipesUsedToday ??
            prev?.swipesUsedToday,
          swipesRemainingToday:
            data.swipesRemainingToday ??
            prev?.swipesRemainingToday,
          dailySwipeLimit:
            data.dailySwipeLimit ??
            data.subscription?.perks?.dailySwipeLimit ??
            prev?.dailySwipeLimit ??
            50,
        }));
      }
    });

    const handleSwipesUpdated = (e) => {
      const detail = e?.detail;
      if (detail) {
        setSubscription((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            swipesUsedToday:
              detail.swipesUsedToday ?? prev.swipesUsedToday,
            swipesRemainingToday:
              detail.swipesRemainingToday ?? prev.swipesRemainingToday,
            dailySwipeLimit:
              detail.dailySwipeLimit ?? prev.dailySwipeLimit ?? 50,
          };
        });
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("pj-auth-changed", handleAuthChange);
    window.addEventListener("pj-swipes-updated", handleSwipesUpdated);
    window.addEventListener("focus", handleFocus);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (unsubMembership) unsubMembership();
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("pj-auth-changed", handleAuthChange);
      window.removeEventListener("pj-swipes-updated", handleSwipesUpdated);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncAuth]);

  const sendOtp = async (email) => {
    return await authService.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    const result = await authService.verifyOtp(email, otp);
    fetchedMeUserRef.current = null;
    fetchedSubUserRef.current = null;
    syncAuth();
    return result;
  };

  const googleLogin = async (payload) => {
    const result = await authService.googleLogin(payload);
    fetchedMeUserRef.current = null;
    fetchedSubUserRef.current = null;
    syncAuth();
    return result;
  };

  const getCurrentUser = async (force = false) => {
    const me = await authService.getCurrentUser(force);
    const resolvedUser = me?.user || (me?.email || me?._id ? me : null) || authService.getUser();
    const resolvedProfile = me?.profile || (me?.photos || me?.bio || me?.birthday || me?.gender || me?.lookingFor ? me : null) || authService.getProfile();
    if (resolvedUser) setUser(resolvedUser);
    if (resolvedProfile) setProfile(resolvedProfile);
    return me;
  };

  const getMe = async (force = false) => {
    return getCurrentUser(force);
  };

  const uploadFaceVerification = async (imageInput) => {
    const result = await authService.uploadFaceVerification(imageInput);
    await syncAuth();
    return result;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("[AuthContext] Logout warning:", err);
    } finally {
      fetchedSubUserRef.current = null;
      fetchedMeUserRef.current = null;
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsAuthenticated(false);
    }
  };

  const refreshSession = () => {
    syncAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isAuthenticated,
        isLoading,
        sendOtp,
        verifyOtp,
        googleLogin,
        uploadFaceVerification,
        getCurrentUser,
        getMe,
        logout,
        refreshSession,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
