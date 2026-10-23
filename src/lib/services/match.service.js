/**
 * Matches API Service for Prem Jodo
 * Integrates with Backend: POST /api/v1/matches/swipe, GET /api/v1/matches/list
 */

import { apiFetch } from "./apiClient";

let inFlightMatchesPromise = null;
let inFlightFeedPromise = null;
let inFlightWhoLikedFeedPromise = null;
let inFlightWhoLikedCountPromise = null;

let cachedWhoLikedCount = null;
let cachedWhoLikedFeed = null;
let lastWhoLikedCountTime = 0;
let lastWhoLikedFeedTime = 0;
const WHO_LIKED_CACHE_TTL = 30000; // 30 seconds cache

export const matchService = {
  /**
   * Record a swipe action (like, dislike, superlike)
   * @param {string} receiverId - Target User ID
   * @param {'like'|'dislike'|'superlike'} action
   * @returns {Promise<Object>} API Response { match, isMutualMatch, conversation, partnerProfile }
   */
  async swipeUser(receiverId, action = "like") {
    if (!receiverId) return null;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(receiverId));
    if (!isObjectId) {
      return {
        isMutualMatch: action === "like" || action === "superlike",
        match: { _id: receiverId, action },
        conversation: { _id: `conv_${receiverId}` },
      };
    }

    try {
      const response = await apiFetch("/matches/swipe", {
        method: "POST",
        body: JSON.stringify({
          receiverId,
          action,
        }),
      });

      const data = await response.json().catch(() => ({}));
      matchService.invalidateWhoLikedCache();

      // Check if backend returned HTTP 429 (Too Many Requests / Daily Swipe Limit Reached)
      if (
        response.status === 429 ||
        data?.statusCode === 429 ||
        (typeof data?.message === "string" && data.message.toLowerCase().includes("daily swipe limit"))
      ) {
        const limitMsg =
          data?.message ||
          "Daily swipe limit reached. Upgrade your plan for unlimited swipes or check back tomorrow!";
        const errorResult = {
          success: false,
          limitReached: true,
          statusCode: 429,
          message: limitMsg,
          dailySwipeLimit: data?.data?.dailySwipeLimit ?? data?.dailySwipeLimit ?? 50,
          swipesUsedToday: data?.data?.swipesUsedToday ?? data?.swipesUsedToday,
          swipesRemainingToday: 0,
        };

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("pj-swipe-limit-reached", {
              detail: errorResult,
            })
          );
        }
        return errorResult;
      }

      if (!response.ok || data?.success === false) {
        console.warn("Backend swipe API note:", data?.message || response.status);
        return {
          isMutualMatch: action === "like" || action === "superlike",
          match: { _id: receiverId, action },
          conversation: { _id: `conv_${receiverId}` },
        };
      }

      const resultData = data?.data || data;

      // Broadcast updated swipe balance to active UI listeners (e.g. counter pills, headers)
      if (typeof window !== "undefined" && resultData) {
        window.dispatchEvent(
          new CustomEvent("pj-swipes-updated", {
            detail: {
              swipesUsedToday: resultData.swipesUsedToday,
              swipesRemainingToday: resultData.swipesRemainingToday,
              dailySwipeLimit: resultData.dailySwipeLimit,
              unlimitedSwipes: resultData.unlimitedSwipes,
              superLikesRemaining: resultData.superLikesRemaining,
            },
          })
        );
      }

      return resultData;
    } catch (error) {
      console.warn("swipeUser network note:", error.message);
      return {
        isMutualMatch: action === "like" || action === "superlike",
        match: { _id: receiverId, action },
        conversation: { _id: `conv_${receiverId}` },
      };
    }
  },

  /**
   * Fetch real discovery feed from backend (with in-flight deduplication)
   * Endpoint: GET /matches/feed
   * @param {boolean} [force=false]
   * @returns {Promise<Array>}
   */
  async getDiscoveryFeed(force = false) {
    if (!force && inFlightFeedPromise) {
      return inFlightFeedPromise;
    }

    inFlightFeedPromise = (async () => {
      try {
        const response = await apiFetch("/matches/feed", {
          method: "GET",
        });

        if (response && response.ok) {
          const data = await response.json().catch(() => ({}));
          return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        }
      } catch (err) {
        console.warn("getDiscoveryFeed note:", err?.message || err);
      } finally {
        setTimeout(() => {
          inFlightFeedPromise = null;
        }, 1500);
      }
      return [];
    })();

    return inFlightFeedPromise;
  },

  /**
   * Fetch users who liked the current user (See Who Liked You) with in-flight deduplication & caching
   * Endpoint: GET /matches/see-who-liked-you
   * Aliases supported on backend: /matches/see-who-like-u, /matches/who-liked-you
   * @param {Object} [params] - Optional filters { page, limit, includeSwiped, action, gender }
   * @param {boolean} [force=false]
   * @returns {Promise<Array>}
   */
  async getWhoLikedYouFeed(params = {}, force = false) {
    if (!force && cachedWhoLikedFeed && Date.now() - lastWhoLikedFeedTime < WHO_LIKED_CACHE_TTL) {
      return cachedWhoLikedFeed;
    }

    if (!force && inFlightWhoLikedFeedPromise) {
      return inFlightWhoLikedFeedPromise;
    }

    inFlightWhoLikedFeedPromise = (async () => {
      try {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page);
        if (params.limit) query.append("limit", params.limit);
        if (params.includeSwiped !== undefined) query.append("includeSwiped", params.includeSwiped);
        if (params.action) query.append("action", params.action);
        if (params.gender) query.append("gender", params.gender);
        if (params.ignorePreferences !== undefined) query.append("ignorePreferences", params.ignorePreferences);

        const qs = query.toString();
        const endpoint = `/matches/see-who-liked-you${qs ? `?${qs}` : ""}`;

        const response = await apiFetch(endpoint, {
          method: "GET",
        });

        if (response && response.ok) {
          const data = await response.json().catch(() => ({}));
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          cachedWhoLikedFeed = list;
          lastWhoLikedFeedTime = Date.now();
          // Also sync cachedWhoLikedCount if appropriate
          if (!params.action && (params.includeSwiped === false || params.includeSwiped === undefined)) {
            cachedWhoLikedCount = list.length;
            lastWhoLikedCountTime = Date.now();
          }
          return list;
        }
      } catch (err) {
        console.warn("getWhoLikedYouFeed note:", err?.message || err);
      } finally {
        setTimeout(() => {
          inFlightWhoLikedFeedPromise = null;
        }, 1500);
      }
      return cachedWhoLikedFeed || [];
    })();

    return inFlightWhoLikedFeedPromise;
  },

  /**
   * Fetch live count of users who liked the current user with in-flight deduplication & caching
   * Endpoint: GET /matches/who-liked-you/count
   * @param {boolean} [force=false]
   * @returns {Promise<number>}
   */
  async getWhoLikedYouCount(force = false) {
    if (!force && cachedWhoLikedCount !== null && Date.now() - lastWhoLikedCountTime < WHO_LIKED_CACHE_TTL) {
      return cachedWhoLikedCount;
    }

    if (!force && inFlightWhoLikedCountPromise) {
      return inFlightWhoLikedCountPromise;
    }

    inFlightWhoLikedCountPromise = (async () => {
      try {
        const response = await apiFetch("/matches/who-liked-you/count", {
          method: "GET",
        });

        if (response && response.ok) {
          const data = await response.json().catch(() => ({}));
          let count = 0;
          if (typeof data?.data?.count === "number") {
            count = data.data.count;
          } else if (typeof data?.count === "number") {
            count = data.count;
          } else if (typeof data?.data === "number") {
            count = data.data;
          }
          cachedWhoLikedCount = count;
          lastWhoLikedCountTime = Date.now();
          return count;
        }
      } catch (err) {
        console.warn("getWhoLikedYouCount note:", err?.message || err);
      } finally {
        setTimeout(() => {
          inFlightWhoLikedCountPromise = null;
        }, 1500);
      }
      return cachedWhoLikedCount ?? 0;
    })();

    return inFlightWhoLikedCountPromise;
  },

  /**
   * Invalidate who liked you cache (e.g. after swiping or rewinding)
   */
  invalidateWhoLikedCache() {
    cachedWhoLikedCount = null;
    cachedWhoLikedFeed = null;
    lastWhoLikedCountTime = 0;
    lastWhoLikedFeedTime = 0;
    inFlightWhoLikedFeedPromise = null;
    inFlightWhoLikedCountPromise = null;
  },

  /**
   * Fetch mutual matches list from backend (with in-flight deduplication)
   * @returns {Promise<Array>} List of mutual match items with partner info
   */
  async getMatches(force = false) {
    if (!force && inFlightMatchesPromise) {
      return inFlightMatchesPromise;
    }

    inFlightMatchesPromise = (async () => {
      try {
        const response = await apiFetch("/matches/list", {
          method: "GET",
        });

        if (!response || !response.ok) {
          return [];
        }

        const data = await response.json().catch(() => ({}));

        if (data?.success === false) {
          return [];
        }

        return Array.isArray(data?.data) ? data.data : [];
      } catch (error) {
        console.warn("getMatches note:", error?.message || error);
        return [];
      } finally {
        setTimeout(() => {
          inFlightMatchesPromise = null;
        }, 1500);
      }
    })();

    return inFlightMatchesPromise;
  },
  /**
   * Unmatch a user / delete match
   * @param {string} matchIdOrPartnerId
   * @returns {Promise<boolean>}
   */
  /**
   * Rewind/undo the last swipe action on a profile
   * @param {string} targetUserId - The ID of the profile to rewind
   * @returns {Promise<Object>}
   */
  async rewindSwipe(targetUserId) {
    if (!targetUserId) return null;
    try {
      const response = await apiFetch("/matches/rewind", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      const data = await response.json().catch(() => ({}));
      matchService.invalidateWhoLikedCache();
      const resData = data?.data || data;

      // Broadcast restored swipe to live UI counter
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj-swipes-updated", {
            detail: {
              isRewound: true,
              targetUserId,
              swipesUsedToday: resData?.swipesUsedToday,
              swipesRemainingToday: resData?.swipesRemainingToday,
              dailySwipeLimit: resData?.dailySwipeLimit,
            },
          })
        );
      }

      return resData;
    } catch (err) {
      console.warn("rewindSwipe note:", err?.message || err);
      return null;
    }
  },

  async unmatchUser(matchIdOrPartnerId) {
    if (!matchIdOrPartnerId) return false;
    try {
      const response = await apiFetch(`/matches/${matchIdOrPartnerId}`, {
        method: "DELETE",
      }).catch(() => null);

      if (response && response.ok) {
        return true;
      }

      // Try alternative unmatch endpoint
      await apiFetch("/matches/unmatch", {
        method: "POST",
        body: JSON.stringify({ matchId: matchIdOrPartnerId, partnerId: matchIdOrPartnerId }),
      }).catch(() => null);

      return true;
    } catch (err) {
      console.warn("Unmatch error:", err);
      return true;
    }
  },
};

export default matchService;
