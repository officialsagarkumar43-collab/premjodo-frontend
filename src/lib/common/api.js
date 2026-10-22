/**
 * Prem Jodo API Service Layer
 * -------------------------------------------------------------
 * Designed for full dynamic multi-language API integration.
 * Automatically attaches Authorization Bearer token & credentials for all backend requests.
 */

import { localizedProfilesData, localizedMatchesData } from "./data";
import { apiFetch } from "@/lib/services/apiClient";
import matchService from "@/lib/services/match.service";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

/**
 * Fetch discovery profiles for matching from backend (/matches/feed)
 * Automatically excludes already liked/disliked profiles
 * @param {string} [language="en"] - Active language code
 * @returns {Promise<Array>} List of user profiles
 */
export async function fetchProfiles(language = "en", force = false) {
  try {
    const feed = await matchService.getDiscoveryFeed(force);
    if (Array.isArray(feed) && feed.length > 0) {
      return feed.map((item) => {
        const userObj = item.user || (item.email || item.fullName ? item : {});
        const profileObj =
          item.profile ||
          (item.birthYear || item.bio || item.photos ? item : item.user ? {} : item);

        const id = userObj._id || profileObj._id || item._id || item.id;
        const name =
          userObj.fullName ||
          profileObj.fullName ||
          profileObj.firstName ||
          userObj.firstName ||
          "Prem Jodo User";

        let photos = [];
        if (Array.isArray(profileObj.photos) && profileObj.photos.length > 0) {
          photos = profileObj.photos
            .map((p) => resolveImageUrl(typeof p === "string" ? p : p?.url))
            .filter(Boolean);
        } else if (profileObj.photo) {
          photos = [resolveImageUrl(profileObj.photo)];
        } else if (userObj.avatar) {
          photos = [resolveImageUrl(userObj.avatar)];
        }

        // Only real photos - no dummy fallbacks
        if (photos.length === 0 && profileObj.photo) {
          const resolved = resolveImageUrl(profileObj.photo);
          if (resolved) photos.push(resolved);
        }

        let age = profileObj.age;
        if (!age && profileObj.birthYear) {
          const bYear = parseInt(profileObj.birthYear, 10);
          if (!isNaN(bYear)) {
            age = new Date().getFullYear() - bYear;
          }
        }
        if (!age && profileObj.birthDate) {
          const bDate = new Date(profileObj.birthDate);
          if (!isNaN(bDate.getTime())) {
            age = new Date().getFullYear() - bDate.getFullYear();
          }
        }
        if (!age) {
          age = 24;
        }

        let interests = [];
        if (Array.isArray(profileObj.interests) && profileObj.interests.length > 0) {
          interests = profileObj.interests
            .map((i) => (typeof i === "string" ? i : i?.name || i?.label || String(i)))
            .filter(Boolean);
        }
        if (interests.length === 0) {
          interests = ["Networking", "Connections", "Music"];
        }

        let locationStr = "India";
        if (typeof profileObj.location === "string") {
          locationStr = profileObj.location;
        } else if (profileObj.location?.city) {
          locationStr = profileObj.location.city;
        } else if (profileObj.city) {
          locationStr = profileObj.city;
        }

        return {
          id: String(id),
          _id: String(id),
          name,
          age,
          gender: profileObj.gender || userObj.gender || "female",
          bio: profileObj.bio || "Looking to connect on Prem Jodo ✨",
          location: locationStr,
          distanceKm: profileObj.distanceKm || Math.floor(Math.random() * 10) + 1,
          occupation: profileObj.occupation || profileObj.education || "Member",
          interests,
          photos,
          isVerified: Boolean(userObj.isVerified ?? profileObj.isVerified ?? true),
          onlineStatus: profileObj.onlineStatus || "online",
          createdAt: profileObj.createdAt || userObj.createdAt || new Date().toISOString(),
          isSuperLike: Boolean(item.isSuperLike || item.hasSuperLiked),
          hasSuperLiked: Boolean(item.hasSuperLiked || item.isSuperLike),
          isBoosted: Boolean(item.isBoosted || item.boostMode),
          boostMode: Boolean(item.boostMode || item.isBoosted),
          boostExpiresAt: item.boostExpiresAt || null,
          superLikedAt: item.superLikedAt || null,
          mode: item.mode || "normal",
          source: item.source || "normal",
          isSuperLikeOrBoost: Boolean(item.isSuperLike || item.hasSuperLiked || item.isBoosted || item.boostMode),
        };
      });
    }
  } catch (err) {
    console.warn("fetchProfiles feed note:", err);
  }

  // If no backend profiles, return empty list so clean empty-state UI renders
  return [];
}

/**
 * Fetch profiles of users who liked the current user (/matches/see-who-liked-you)
 * @param {Object} [params] - Query filters { page, limit, includeSwiped, action, gender }
 * @returns {Promise<Array>} List of formatted profiles who liked you
 */
export async function fetchWhoLikedYouProfiles(params = {}, force = false) {
  try {
    const list = await matchService.getWhoLikedYouFeed(params, force);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item) => {
        const userObj = item.user || (item.email || item.fullName ? item : {});
        const profileObj =
          item.profile ||
          (item.birthYear || item.bio || item.photos ? item : item.user ? {} : item);

        const id = userObj._id || profileObj._id || item.userId || item._id || item.id;
        const name =
          userObj.fullName ||
          profileObj.fullName ||
          profileObj.firstName ||
          userObj.firstName ||
          item.fullName ||
          "Prem Jodo Member";

        let photos = [];
        const rawPhotos = profileObj.photos || item.photos;
        if (Array.isArray(rawPhotos) && rawPhotos.length > 0) {
          photos = rawPhotos
            .map((p) => resolveImageUrl(typeof p === "string" ? p : p?.url))
            .filter(Boolean);
        } else if (profileObj.photo || item.photo) {
          photos = [resolveImageUrl(profileObj.photo || item.photo)];
        } else if (userObj.avatar || item.avatar) {
          photos = [resolveImageUrl(userObj.avatar || item.avatar)];
        }

        if (photos.length === 0 && (profileObj.photo || item.photo)) {
          const resolved = resolveImageUrl(profileObj.photo || item.photo);
          if (resolved) photos.push(resolved);
        }

        let age = profileObj.age || item.age;
        if (!age && profileObj.birthYear) {
          const bYear = parseInt(profileObj.birthYear, 10);
          if (!isNaN(bYear)) {
            age = new Date().getFullYear() - bYear;
          }
        }
        if (!age && profileObj.birthDate) {
          const bDate = new Date(profileObj.birthDate);
          if (!isNaN(bDate.getTime())) {
            age = new Date().getFullYear() - bDate.getFullYear();
          }
        }
        if (!age) {
          age = 24;
        }

        let interests = [];
        const rawInterests = profileObj.interests || item.interests;
        if (Array.isArray(rawInterests) && rawInterests.length > 0) {
          interests = rawInterests
            .map((i) => (typeof i === "string" ? i : i?.name || i?.label || String(i)))
            .filter(Boolean);
        }
        if (interests.length === 0) {
          interests = ["Connections", "Romance", "Music"];
        }

        let locationStr = item.city || "Nearby";
        if (typeof profileObj.location === "string") {
          locationStr = profileObj.location;
        } else if (profileObj.location?.city) {
          locationStr = profileObj.location.city;
        } else if (profileObj.city) {
          locationStr = profileObj.city;
        } else if (item.city && item.state) {
          locationStr = `${item.city}, ${item.state}`;
        }

        const isSuper = Boolean(
          item.isSuperLike ||
          item.hasSuperLiked ||
          item.isSuperLiked ||
          item.likeAction === "superlike" ||
          item.swipeAction === "superlike" ||
          item.action === "superlike"
        );

        return {
          id: String(id),
          _id: String(id),
          userId: String(item.userId || id),
          name,
          age,
          gender: profileObj.gender || userObj.gender || item.gender || "female",
          bio: profileObj.bio || item.bio || "Liked your profile on Prem Jodo ✨",
          location: locationStr,
          city: item.city || profileObj.city || locationStr,
          state: item.state || "",
          distanceKm: item.distance || profileObj.distanceKm || 4,
          occupation: profileObj.occupation || profileObj.education || item.education || "Member",
          education: profileObj.education || item.education || profileObj.occupation || "Graduate",
          lookingFor: profileObj.lookingFor || item.lookingFor || "Long-term partner",
          interests,
          photos,
          isVerified: Boolean(userObj.isVerified ?? profileObj.isVerified ?? item.isVerified ?? true),
          onlineStatus: profileObj.onlineStatus || item.onlineStatus || "online",
          createdAt: profileObj.createdAt || userObj.createdAt || item.createdAt || new Date().toISOString(),
          likedAt: item.likedAt || item.createdAt || new Date().toISOString(),
          likeAction: item.likeAction || (isSuper ? "superlike" : "like"),
          isSuperLike: isSuper,
          hasSuperLiked: isSuper,
          isSuperLiked: isSuper,
          superLikedAt: item.superLikedAt || (isSuper ? item.likedAt : null),
          isBoosted: Boolean(item.isBoosted || item.boostMode),
          boostMode: Boolean(item.boostMode || item.isBoosted),
          matchId: item.matchId || null,
          isWhoLikedYou: true,
          isMutualMatch: Boolean(item.isMutualMatch),
        };
      });
    }
  } catch (err) {
    console.warn("fetchWhoLikedYouProfiles note:", err);
  }
  return [];
}

/**
 * Fetch user matches from backend API (/matches/list) with token
 * @param {string} [language="en"] - Active language code fallback
 * @returns {Promise<Array>} List of matches
 */
export async function fetchMatches(language = "en") {
  try {
    const response = await apiFetch("/matches/list", {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json().catch(() => null);
      const list = Array.isArray(result) ? result : result?.data;
      if (Array.isArray(list) && list.length > 0) {
        const seen = new Set();
        const formatted = [];

        for (const m of list) {
          const partner = m.partner || (m.partnerUserId ? { _id: m.partnerUserId } : {});
          const partnerKey = String(partner._id || m.partnerUserId || m._id || "");

          if (partnerKey && !seen.has(partnerKey)) {
            seen.add(partnerKey);
            const profile = m.partnerProfile || {};
            const photo = resolveImageUrl(
              profile.photos?.[0]?.url ||
              profile.photos?.[0] ||
              profile.photo ||
              partner.avatar ||
              ""
            );

            formatted.push({
              id: m._id || partner._id,
              conversationId: m.conversation?._id || m._id,
              userName: partner.fullName || profile.firstName || "Match",
              userAvatar: photo,
              lastMessage: "It's a match! Say hello ✨",
              matchedAt: m.matchedAt || new Date().toISOString(),
              unreadCount: 1,
              partnerUserId: partner._id,
            });
          }
        }
        return formatted;
      }
    }
  } catch (err) {
    console.warn("Backend /matches/list call note:", err);
  }

  // If no backend matches, return empty list
  return [];
}

/**
 * Submit user contact / support ticket
 * @param {Object} payload - { name, email, topic, message }
 */
export async function submitSupportTicket(payload) {
  try {
    const response = await apiFetch("/support", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Register for a singles community event
 * @param {string} eventId - Event ID
 */
export async function registerForEvent(eventId) {
  try {
    const response = await apiFetch(`/events/${eventId}/rsvp`, {
      method: "POST",
    });
    return response.ok;
  } catch {
    return false;
  }
}

