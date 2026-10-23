"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Calculates remaining hours, minutes, seconds until next midnight (12:00 AM IST/Local)
 */
export function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // next midnight

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n) => String(n).padStart(2, "0");
  return {
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diffMs / 1000),
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    human: `${hours}h ${minutes}m ${seconds}s`,
  };
}

export function useSwipeLimit() {
  const { user, subscription } = useAuth();
  const hasWarnedTenRef = useRef(false);

  const isVip = Boolean(
    subscription?.status === "active" ||
    subscription?.isVip ||
    user?.role === "admin"
  );

  const isUnlimited = Boolean(
    subscription?.perks?.unlimitedSwipes || isVip
  );

  const dailyLimit = useMemo(() => {
    if (isUnlimited) return Infinity;
    const limit =
      subscription?.dailySwipeLimit ??
      subscription?.perks?.dailySwipeLimit;
    return typeof limit === "number" && limit >= 0 ? limit : 50;
  }, [subscription, isUnlimited]);

  // Determine initial used and remaining swipes considering daily midnight reset
  const initialUsed = useMemo(() => {
    if (isUnlimited) return 0;
    const now = new Date();
    const lastReset = subscription?.lastSwipeResetAt
      ? new Date(subscription.lastSwipeResetAt)
      : new Date(0);
    const isNewDay = now.toDateString() !== lastReset.toDateString();
    return isNewDay ? 0 : subscription?.swipesUsedToday || 0;
  }, [subscription, isUnlimited]);

  const [swipesUsed, setSwipesUsed] = useState(initialUsed);
  const [swipesRemaining, setSwipesRemaining] = useState(() => {
    if (isUnlimited) return "unlimited";
    if (typeof subscription?.swipesRemainingToday === "number") {
      return subscription.swipesRemainingToday;
    }
    return Math.max(0, dailyLimit - initialUsed);
  });

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Keep state in sync when subscription updates in AuthContext
  useEffect(() => {
    if (isUnlimited) {
      setSwipesRemaining("unlimited");
      setSwipesUsed(0);
      return;
    }

    const now = new Date();
    const lastReset = subscription?.lastSwipeResetAt
      ? new Date(subscription.lastSwipeResetAt)
      : new Date(0);
    const isNewDay = now.toDateString() !== lastReset.toDateString();
    const used = isNewDay ? 0 : subscription?.swipesUsedToday || 0;

    setSwipesUsed(used);
    const remaining =
      typeof subscription?.swipesRemainingToday === "number"
        ? subscription.swipesRemainingToday
        : Math.max(0, dailyLimit - used);
    setSwipesRemaining(remaining);
  }, [subscription, isUnlimited, dailyLimit]);

  // Live midnight countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const nextTime = getTimeUntilMidnight();
      setCountdown(nextTime);

      // If midnight crossed (totalSeconds <= 0), reset used count automatically
      if (nextTime.totalSeconds <= 1 && !isUnlimited) {
        setSwipesUsed(0);
        setSwipesRemaining(dailyLimit);
        setShowLimitModal(false);
        hasWarnedTenRef.current = false;
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isUnlimited, dailyLimit]);

  // Listen for real-time swipe events dispatched by matchService and socket
  useEffect(() => {
    const handleSwipesUpdated = (e) => {
      const data = e?.detail;
      if (!data) return;

      if (data.unlimitedSwipes || isUnlimited) {
        setSwipesRemaining("unlimited");
        setSwipesUsed(0);
        return;
      }

      let nextRem = null;
      if (typeof data.swipesRemainingToday === "number") {
        nextRem = data.swipesRemainingToday;
        setSwipesRemaining(data.swipesRemainingToday);
      } else if (data.isRewound) {
        setSwipesRemaining((prev) => {
          const updated = typeof prev === "number" ? Math.min(dailyLimit, prev + 1) : prev;
          nextRem = updated;
          return updated;
        });
      } else if (typeof data.swipesUsedToday === "number") {
        nextRem = Math.max(0, dailyLimit - data.swipesUsedToday);
        setSwipesRemaining(nextRem);
      }

      if (typeof data.swipesUsedToday === "number") {
        setSwipesUsed(data.swipesUsedToday);
      } else if (data.isRewound) {
        setSwipesUsed((prev) => Math.max(0, prev - 1));
      }

      // Check if user has reached exactly 10 remaining swipes
      if (nextRem === 10 && !hasWarnedTenRef.current) {
        hasWarnedTenRef.current = true;
        setShowLimitModal(true);
      } else if (nextRem !== null && nextRem <= 0) {
        setShowLimitModal(true);
      }
    };

    const handleLimitReached = (e) => {
      const data = e?.detail;
      if (!isUnlimited) {
        setSwipesRemaining(0);
        if (data?.message) {
          setLimitErrorMessage(data.message);
        }
        setShowLimitModal(true);
      }
    };

    window.addEventListener("pj-swipes-updated", handleSwipesUpdated);
    window.addEventListener("pj-swipe-limit-reached", handleLimitReached);

    return () => {
      window.removeEventListener("pj-swipes-updated", handleSwipesUpdated);
      window.removeEventListener("pj-swipe-limit-reached", handleLimitReached);
    };
  }, [isUnlimited, dailyLimit]);

  const isLimitReached = Boolean(
    !isUnlimited &&
    (swipesRemaining === 0 ||
      (typeof swipesRemaining === "number" && swipesRemaining <= 0))
  );

  /**
   * Safe check before triggering swipe
   * Returns true if user can swipe, or false + triggers limit modal if out of swipes
   */
  const checkCanSwipe = useCallback(() => {
    if (isUnlimited) return true;
    if (isLimitReached) {
      setShowLimitModal(true);
      return false;
    }
    return true;
  }, [isUnlimited, isLimitReached]);

  /**
   * Helper to optimistically decrement swipes or update from API response
   */
  const recordSwipeSuccess = useCallback(
    (resData) => {
      if (isUnlimited) return;

      let nextRemaining;
      if (typeof resData?.swipesRemainingToday === "number") {
        nextRemaining = resData.swipesRemainingToday;
        setSwipesRemaining(resData.swipesRemainingToday);
      } else {
        setSwipesRemaining((prev) => {
          const val = typeof prev === "number" ? Math.max(0, prev - 1) : 0;
          nextRemaining = val;
          return val;
        });
      }

      if (typeof resData?.swipesUsedToday === "number") {
        setSwipesUsed(resData.swipesUsedToday);
      } else {
        setSwipesUsed((prev) => prev + 1);
      }

      // Trigger upgrade alert modal when user hits 10 remaining swipes
      if (nextRemaining === 10 && !hasWarnedTenRef.current) {
        hasWarnedTenRef.current = true;
        setShowLimitModal(true);
      } else if (nextRemaining <= 0) {
        setShowLimitModal(true);
      }
    },
    [isUnlimited]
  );

  /**
   * Helper to restore 1 swipe on rewind
   */
  const recordRewindSuccess = useCallback(
    (resData) => {
      if (isUnlimited) return;

      if (typeof resData?.swipesRemainingToday === "number") {
        setSwipesRemaining(resData.swipesRemainingToday);
      } else {
        setSwipesRemaining((prev) =>
          typeof prev === "number" ? Math.min(dailyLimit, prev + 1) : prev
        );
      }

      if (typeof resData?.swipesUsedToday === "number") {
        setSwipesUsed(resData.swipesUsedToday);
      } else {
        setSwipesUsed((prev) => Math.max(0, prev - 1));
      }
    },
    [isUnlimited, dailyLimit]
  );

  return {
    swipesRemaining,
    swipesUsed,
    dailyLimit,
    isUnlimited,
    isLimitReached,
    showLimitModal,
    setShowLimitModal,
    limitErrorMessage,
    countdown,
    checkCanSwipe,
    recordSwipeSuccess,
    recordRewindSuccess,
  };
}

export default useSwipeLimit;
