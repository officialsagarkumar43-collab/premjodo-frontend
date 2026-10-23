"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SwipeCard } from "@/components/common/SwipeCard";
import { MatchesList } from "@/components/common/MatchesList";
import { fetchProfiles, fetchMatches } from "@/lib/common/api";
import matchService from "@/lib/services/match.service";
import chatService from "@/lib/services/chat.service";
import socketService from "@/lib/services/socket.service";
import { useAuth } from "@/context/AuthContext";
import authService from "@/lib/services/auth.service";
import { isBattleReady } from "@/lib/common/featureFlags";
import { Sparkles, Heart, MessageCircle, X, Swords, Coins, ArrowRight } from "lucide-react";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

function DiscoveryRadarLoader({ userAvatar }) {
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (userAvatar) return resolveImageUrl(userAvatar);
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("pj_user_avatar");
        if (cached) return resolveImageUrl(cached);
        const syncProf = authService?.getProfile?.();
        const syncUsr = authService?.getUser?.();
        const raw =
          syncProf?.photos?.[0]?.url ||
          syncProf?.photos?.[0] ||
          syncProf?.photo ||
          syncUsr?.avatar ||
          syncUsr?.photo;
        if (raw) return resolveImageUrl(raw);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (userAvatar) {
      setAvatarUrl(resolveImageUrl(userAvatar));
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("pj_user_avatar", typeof userAvatar === "string" ? userAvatar : userAvatar?.url || "");
        } catch {}
      }
    } else if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("pj_user_avatar");
      if (cached) {
        setAvatarUrl(resolveImageUrl(cached));
      } else {
        const syncProf = authService?.getProfile?.();
        const syncUsr = authService?.getUser?.();
        const raw =
          syncProf?.photos?.[0]?.url ||
          syncProf?.photos?.[0] ||
          syncProf?.photo ||
          syncUsr?.avatar ||
          syncUsr?.photo;
        if (raw) {
          setAvatarUrl(resolveImageUrl(raw));
          try {
            sessionStorage.setItem("pj_user_avatar", typeof raw === "string" ? raw : raw?.url || "");
          } catch {}
        }
      }
    }
  }, [userAvatar]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[75vh] select-none animate-in fade-in duration-300 px-4 overflow-hidden max-w-full">
      {/* Radar Pulse Rings Container */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Outermost Radar Ripple Ring */}
        <div className="absolute w-full h-full rounded-full border border-amber-500/20 bg-amber-500/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />

        {/* Middle Radar Ripple Ring */}
        <div
          className="absolute w-48 h-48 rounded-full border border-rose-500/30 bg-gradient-to-tr from-rose-500/10 to-amber-500/5 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"
          style={{ animationDelay: "600ms" }}
        />

        {/* Inner Radar Glow */}
        <div
          className="absolute w-36 h-36 rounded-full border border-amber-400/40 bg-amber-400/10 animate-pulse"
          style={{ animationDuration: "2s" }}
        />

        {/* Center User Avatar with Glowing Gold/Rose Border */}
        <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500 shadow-2xl shadow-rose-500/30">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-500/30 to-amber-500/30 flex items-center justify-center text-white">
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
              </div>
            )}
          </div>

          {/* Glowing live radar indicator */}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse shadow-md shadow-emerald-500/50" />
        </div>
      </div>

      {/* Animated Text below Radar */}
      <div className="mt-8 flex flex-col items-center text-center gap-1.5">
        <p className="text-base sm:text-lg poppins-medium text-zinc-300 dark:text-zinc-200 tracking-wide flex items-center gap-1">
          <span>Finding people near you</span>
          <span className="inline-flex gap-1 ml-0.5">
            <span className="animate-bounce inline-block" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "200ms" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "400ms" }}>.</span>
          </span>
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Scanning verified singles nearby...
        </p>
      </div>
    </div>
  );
}

function DiscoveryContent() {
  const router = useRouter();
  const { user, profile: authProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [mutualMatchPopup, setMutualMatchPopup] = useState(null);
  const [matchOpenerText, setMatchOpenerText] = useState("Hey! It's a match ✨ Excited to connect with you!");
  const [isLoading, setIsLoading] = useState(true);

  const hasLoadedDataRef = useRef(false);
  const prevUserIdRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  const userAvatar =
    authProfile?.photos?.[0]?.url ||
    authProfile?.photos?.[0] ||
    authProfile?.photo ||
    user?.avatar ||
    user?.photo ||
    (typeof window !== "undefined"
      ? authService?.getProfile?.()?.photos?.[0]?.url ||
        authService?.getProfile?.()?.photos?.[0] ||
        authService?.getProfile?.()?.photo ||
        authService?.getUser?.()?.avatar ||
        authService?.getUser?.()?.photo
      : null);

  useEffect(() => {
    if (hasLoadedDataRef.current && prevUserIdRef.current === currentUserId) return;
    hasLoadedDataRef.current = true;
    prevUserIdRef.current = currentUserId;

    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedProfiles, backendMatches, backendConversations] = await Promise.all([
          fetchProfiles("en"),
          matchService.getMatches().catch(() => []),
          chatService.getConversations().catch(() => []),
          new Promise((resolve) => setTimeout(resolve, 1400)),
        ]);

        setProfiles(loadedProfiles);

        if (!Array.isArray(loadedProfiles) || loadedProfiles.length === 0) {
          hasLoadedDataRef.current = false;
        }

        const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
        const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;

        const myIds = new Set(
          [
            user?._id,
            user?.id,
            user?.userId,
            authProfile?._id,
            authProfile?.userId,
            authProfile?.user?._id,
            authProfile?.user,
            storedUser?._id,
            storedUser?.id,
            storedProfile?._id,
            storedProfile?.userId,
          ]
            .filter(Boolean)
            .map(String)
        );

        const myEmails = new Set(
          [
            user?.email,
            authProfile?.email,
            storedUser?.email,
            storedProfile?.email,
          ]
            .filter(Boolean)
            .map((e) => e.trim().toLowerCase())
        );

        const myNames = new Set(
          [
            user?.name,
            user?.fullName,
            user?.firstName,
            authProfile?.fullName,
            authProfile?.firstName,
            storedUser?.name,
            storedUser?.fullName,
            storedProfile?.fullName,
          ]
            .filter(Boolean)
            .map((n) => n.trim().toLowerCase())
        );

        const isCurrentUser = (entity) => {
          if (!entity) return false;
          const entityId = String(
            entity._id || entity.id || entity.userId || (typeof entity === "string" ? entity : "")
          );
          if (entityId && myIds.has(entityId)) return true;

          const entityEmail = (entity.email || "").trim().toLowerCase();
          if (entityEmail && myEmails.has(entityEmail)) return true;

          const entityName = (entity.fullName || entity.name || entity.firstName || "").trim().toLowerCase();
          if (entityName && myNames.size > 0 && myNames.has(entityName)) {
            if (entityId && myIds.has(entityId)) return true;
            if (!entityId || entityId.length < 10) return true;
          }

          return false;
        };

        const getPartnerData = (item) => {
          let partner = null;
          let prof = item.partnerProfile || item.profile || {};

          if (item.partner && !isCurrentUser(item.partner)) {
            partner = item.partner;
          } else if (item.partnerUserId && !myIds.has(String(item.partnerUserId))) {
            partner = { _id: String(item.partnerUserId) };
          }

          if ((!partner || !partner._id) && Array.isArray(item.participants)) {
            const otherParticipant = item.participants.find((p) => !isCurrentUser(p));
            if (otherParticipant) {
              partner = typeof otherParticipant === "object" ? otherParticipant : { _id: String(otherParticipant) };
              if (typeof otherParticipant === "object" && otherParticipant.profile) {
                prof = { ...prof, ...otherParticipant.profile };
              }
            }
          }

          if ((!partner || !partner._id) && item.sender && item.receiver) {
            if (isCurrentUser(item.sender)) {
              partner = typeof item.receiver === "object" ? item.receiver : { _id: String(item.receiver?._id || item.receiver) };
              if (item.receiver?.profile) prof = { ...prof, ...item.receiver.profile };
            } else {
              partner = typeof item.sender === "object" ? item.sender : { _id: String(item.sender?._id || item.sender) };
              if (item.sender?.profile) prof = { ...prof, ...item.sender.profile };
            }
          }

          if (!partner || isCurrentUser(partner)) return null;
          const partnerId = partner._id ? String(partner._id) : null;
          if (partnerId && myIds.has(partnerId)) return null;

          const userName =
            partner.fullName ||
            partner.name ||
            prof.fullName ||
            prof.firstName ||
            "";

          if (!userName) return null;
          if (myNames.has(userName.trim().toLowerCase()) && (partnerId ? myIds.has(partnerId) : true)) return null;

          const photo = resolveImageUrl(
            prof.photos?.[0]?.url ||
            prof.photos?.[0] ||
            prof.photo ||
            partner.avatar,
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
          );

          const age = prof?.age || partner?.age || 24;
          const bio = prof?.bio || "Hey! Nice to connect with you on Prem Jodo ✨";
          const city = prof?.location?.city || prof?.city || "Nearby";
          const photos = Array.isArray(prof?.photos) && prof.photos.length > 0
            ? prof.photos.map((p) => resolveImageUrl(typeof p === "string" ? p : p?.url)).filter(Boolean)
            : [photo];

          return {
            partnerId,
            userName,
            photo,
            photos,
            age,
            bio,
            city,
            profile: prof,
          };
        };

        const seenPartners = new Set();
        const formatted = [];

        if (Array.isArray(backendMatches)) {
          for (const m of backendMatches) {
            const pData = getPartnerData(m);
            if (!pData) continue;

            const partnerKey = pData.partnerId || String(m._id || "");
            const latestMsg =
              m.lastMessage?.content ||
              m.lastMessage?.text ||
              m.lastMessage?.message ||
              (typeof m.lastMessage === "string" ? m.lastMessage : null) ||
              "It's a match! Say hello ✨";
            const latestTime = m.lastMessage?.createdAt || m.matchedAt || m.updatedAt || new Date().toISOString();

            if (partnerKey && !seenPartners.has(partnerKey)) {
              seenPartners.add(partnerKey);
              formatted.push({
                id: m._id || pData.partnerId,
                conversationId: m.conversation?._id || m.conversation || m._id,
                userName: pData.userName,
                userAvatar: pData.photo,
                photos: pData.photos,
                age: pData.age,
                bio: pData.bio,
                city: pData.city,
                lastMessage: latestMsg,
                matchedAt: latestTime,
                lastMessageTime: latestTime,
                unreadCount: 0,
                partnerUserId: pData.partnerId,
              });
            }
          }
        }

        if (Array.isArray(backendConversations)) {
          const currentUserId = user?._id || user?.id;
          for (const conv of backendConversations) {
            const pData = getPartnerData(conv);
            if (!pData) continue;

            const partnerKey = pData.partnerId || String(conv._id || "");
            const latestMsg =
              conv.lastMessage?.content ||
              conv.lastMessage?.text ||
              conv.lastMessage?.message ||
              (typeof conv.lastMessage === "string" ? conv.lastMessage : null);
            const latestTime = conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt;
            const lastMsgSenderId = conv.lastMessage?.sender?._id || conv.lastMessage?.sender;
            const isLastMsgFromMe = lastMsgSenderId && currentUserId && (String(lastMsgSenderId) === String(currentUserId));

            let unreadCnt = 0;
            if (isLastMsgFromMe) {
              unreadCnt = 0;
            } else if (typeof conv.unreadCount === "number" && conv.unreadCount > 0) {
              unreadCnt = conv.unreadCount;
            } else if (conv.lastMessage && !isLastMsgFromMe) {
              if (conv.lastMessage.isRead === false) {
                unreadCnt = Math.max(conv.unreadCount || 0, 1);
              } else if (conv.lastMessage.isRead === true) {
                unreadCnt = 0;
              }
            } else {
              unreadCnt = conv.unreadCount || 0;
            }

            const existingIdx = formatted.findIndex(
              (m) =>
                (pData.partnerId && String(m.partnerUserId) === String(pData.partnerId)) ||
                String(m.id) === String(conv._id) ||
                String(m.conversationId) === String(conv._id)
            );

            if (existingIdx !== -1) {
              formatted[existingIdx].conversationId = conv._id;
              if (pData.photos) formatted[existingIdx].photos = pData.photos;
              if (pData.age) formatted[existingIdx].age = pData.age;
              if (pData.bio) formatted[existingIdx].bio = pData.bio;
              if (pData.city) formatted[existingIdx].city = pData.city;
              if (latestMsg) {
                formatted[existingIdx].lastMessage = latestMsg;
              }
              if (latestTime) {
                formatted[existingIdx].lastMessageTime = latestTime;
                formatted[existingIdx].matchedAt = latestTime;
              }
              formatted[existingIdx].unreadCount = unreadCnt;
              if (Array.isArray(conv.messages)) {
                formatted[existingIdx].messages = conv.messages;
              }
            } else if (!seenPartners.has(partnerKey)) {
              seenPartners.add(partnerKey);
              formatted.push({
                id: conv._id,
                conversationId: conv._id,
                userName: pData.userName,
                userAvatar: pData.photo,
                photos: pData.photos,
                age: pData.age,
                bio: pData.bio,
                city: pData.city,
                lastMessage: latestMsg || "Say hello ✨",
                matchedAt: latestTime,
                lastMessageTime: latestTime,
                unreadCount: unreadCnt,
                partnerUserId: pData.partnerId,
                messages: Array.isArray(conv.messages) ? conv.messages : [],
              });
            }
          }
        }

        setMatches(formatted);
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(
              new CustomEvent("pj-matches-updated", {
                detail: { count: formatted.length },
              })
            );
          } catch { }
        }
      } catch (err) {
        console.warn("loadData error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUserId]);

  // Real-time socket listener for live message previews & timestamp updates on discovery page
  useEffect(() => {
    const currentUserId = user?._id || user?.id;
    if (currentUserId) {
      socketService.connect(currentUserId);
    }

    const unsubMsg = socketService.onMessageReceived((newMsg) => {
      if (!newMsg) return;
      const text = String(newMsg.content || newMsg.text || newMsg.message || newMsg.body || "").trim();
      const senderId = String(newMsg.sender?._id || newMsg.sender?.id || (typeof newMsg.sender === "string" ? newMsg.sender : "") || newMsg.senderId || newMsg.from || "").trim();
      const convId = String(newMsg.conversationId || newMsg.conversation?._id || (typeof newMsg.conversation === "string" ? newMsg.conversation : "") || newMsg.chatId || "").trim();
      const msgTime = newMsg.createdAt || newMsg.timestamp || new Date().toISOString();
      const isMe = currentUserId && String(senderId) === String(currentUserId);
      const partnerName = newMsg.senderName || newMsg.sender?.fullName || newMsg.sender?.name || "Match";
      const partnerPhoto = newMsg.senderPhoto || newMsg.sender?.avatar || newMsg.sender?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

      if (text) {
        setMatches((prev) => {
          let found = false;
          const updated = prev.map((m) => {
            const partnerId = String(m.partnerUserId || "");
            const mId = String(m.id || "");
            const mConvId = String(m.conversationId || "");

            const isTarget =
              (convId && (mConvId === convId || mId === convId || mConvId.replace(/^conv_/, "") === convId.replace(/^conv_/, ""))) ||
              (partnerId && (partnerId === senderId || (isMe && partnerId === String(newMsg.receiverId))));

            if (isTarget) {
              found = true;
              return {
                ...m,
                conversationId: convId || m.conversationId,
                lastMessage: text,
                lastMessageTime: msgTime,
                matchedAt: msgTime,
                unreadCount: isMe ? (m.unreadCount || 0) : ((m.unreadCount || 0) + 1),
              };
            }
            return m;
          });

          if (!found) {
            const newItem = {
              id: convId || `conv_${Date.now()}`,
              conversationId: convId || `conv_${Date.now()}`,
              userName: partnerName,
              userAvatar: partnerPhoto,
              lastMessage: text,
              lastMessageTime: msgTime,
              matchedAt: msgTime,
              partnerUserId: senderId,
              unreadCount: isMe ? 0 : 1,
            };
            updated.unshift(newItem);
          }

          if (typeof window !== "undefined") {
            try {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("pj-matches-updated", { detail: { count: updated.length } }));
              }, 0);
            } catch { }
          }
          return updated;
        });
      }
    });

    const unsubNewMatch = socketService.onNewMatch((data) => {
      if (!data) return;
      const partnerName = data.userName || data.partner?.profile?.fullName || data.partner?.fullName || "New Match";
      const partnerPhoto = data.userAvatar || data.partner?.profile?.photos?.[0]?.url || data.partner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
      const convId = String(data.conversationId || data.conversation?._id || data.conversation || `conv_${Date.now()}`);
      const partnerId = String(data.partnerUserId || data.partner?._id || data.partner?.user?._id || "");

      setMatches((prev) => {
        if (prev.some((m) => String(m.conversationId) === convId || (partnerId && String(m.partnerUserId) === partnerId))) {
          return prev;
        }
        const item = {
          id: convId,
          conversationId: convId,
          userName: partnerName,
          userAvatar: partnerPhoto,
          lastMessage: data.lastMessage || "It's a match! Say hello ✨",
          lastMessageTime: data.lastMessageTime || new Date().toISOString(),
          matchedAt: data.lastMessageTime || new Date().toISOString(),
          partnerUserId: partnerId,
          unreadCount: 0,
        };
        const next = [item, ...prev];
        if (typeof window !== "undefined") {
          try {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("pj-matches-updated", { detail: { count: next.length } }));
            }, 0);
          } catch { }
        }
        return next;
      });
    });

    const unsubConv = socketService.onConversationUpdated((data) => {
      if (!data) return;
      const convId = String(data.conversationId?._id || data.conversationId || "");
      const cleanId = convId.replace(/^conv_/, "");
      const lastMsg =
        data.lastMessage?.content ||
        data.lastMessage?.text ||
        data.lastMessage?.message ||
        (typeof data.lastMessage === "string" ? data.lastMessage : "");
      const updateTime = data.updatedAt || data.lastMessage?.createdAt || new Date().toISOString();

      if (lastMsg) {
        setMatches((prev) =>
          prev.map((m) => {
            const mId = String(m.id || "");
            const mConvId = String(m.conversationId || "");

            const isTarget = convId && (mConvId === convId || mId === convId || mConvId.replace(/^conv_/, "") === cleanId);
            if (isTarget) {
              return {
                ...m,
                conversationId: convId || m.conversationId,
                lastMessage: lastMsg,
                lastMessageTime: updateTime,
                matchedAt: updateTime,
              };
            }
            return m;
          })
        );
      }
    });

    return () => {
      if (unsubMsg) unsubMsg();
      if (unsubNewMatch) unsubNewMatch();
      if (unsubConv) unsubConv();
    };
  }, [user]);

  const handleSwipe = async (profile, action) => {
    try {
      const targetId = profile._id || profile.id;
      if (targetId) {
        const res = await matchService.swipeUser(targetId, action);
        if (res?.limitReached) {
          return;
        }
        if (res?.isMutualMatch) {
          setMutualMatchPopup({
            partnerName: profile.name,
            partnerPhoto: profile.photos?.[0] || profile.photo,
            conversationId: res.conversation?._id || res.match?._id,
          });
        }
      }
    } catch (err) {
      console.warn("Swipe recording note:", err.message);
    }
  };

  const handleRewind = async (prevProfile) => {
    if (!prevProfile) return;
    try {
      const targetId = prevProfile._id || prevProfile.id;
      if (targetId) {
        await matchService.rewindSwipe(targetId);
      }
    } catch (err) {
      console.warn("handleRewind note:", err.message);
    }
  };

  if (isLoading) {
    return <DiscoveryRadarLoader userAvatar={userAvatar} />;
  }

  const hasMatches = Array.isArray(matches) && matches.length > 0;

  return (
    <div
      className={
        hasMatches
          ? "grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 items-stretch w-full max-w-7xl mx-auto h-full max-h-full min-h-0 overflow-hidden"
          : "flex flex-col items-center justify-center w-full max-w-md mx-auto h-full max-h-full min-h-0 overflow-hidden"
      }
    >
      {/* Main Swipe Deck (Center / Left Column: 5 Cols when matches exist) */}
      <div className={`${hasMatches ? "lg:col-span-5 xl:col-span-5" : "w-full"} flex flex-col items-center w-full h-full max-h-full min-h-0 justify-center overflow-hidden`}>
        <div className="w-full flex-1 min-h-0 flex items-center justify-center h-full max-h-full">
          <SwipeCard profiles={profiles} onSwipe={handleSwipe} onRewind={handleRewind} />
        </div>
      </div>

      {/* Side Matches & Messages Bar (Right Column: 7 Cols - Wider Width) */}
      {hasMatches && (
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col h-full max-h-full min-h-0 space-y-3 w-full overflow-hidden">
          {/* Matches list */}
          <MatchesList matches={matches} />

          {/* Ludo Cash Battle Arena Banner (Controlled via NEXT_PUBLIC_IS_READY_BATTLE) */}
          {isBattleReady && (
            <Link
              href="/user/battle"
              prefetch={false}
              className="group block p-4 rounded-2xl bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-purple-500/15 border border-rose-500/30 hover:border-rose-500/60 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  HOT • Real Cash
                </span>
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Win up to ₹900
                </span>
              </div>

              <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-rose-500 transition-colors flex items-center gap-1.5">
                <span>Play Ludo Battles</span>
                <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed truncate">
                Challenge matched members or online players in 1v1 Ludo for real cash with instant UPI withdrawal.
              </p>
            </Link>
          )}
        </div>
      )}

      {/* It's a Match Celebration Modal */}
      {mutualMatchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in"
            onClick={() => setMutualMatchPopup(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl p-6 sm:p-7 text-center shadow-2xl border border-rose-500/30 z-10 animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setMutualMatchPopup(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30 animate-bounce">
              <Heart className="w-7 h-7 fill-white" />
            </div>

            <div>
              <h3 className="text-2xl poppins-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent mb-1">
                It&apos;s a Match!
              </h3>
              <p className="text-xs poppins-medium text-zinc-600 dark:text-zinc-400">
                You and <strong className="text-zinc-900 dark:text-white">{mutualMatchPopup.partnerName}</strong> liked each other.
              </p>
            </div>

            {mutualMatchPopup.partnerPhoto && (
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-rose-500/50 shadow-xl">
                <img
                  src={resolveImageUrl(
                    mutualMatchPopup.partnerPhoto,
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  )}
                  alt={mutualMatchPopup.partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Icebreaker Opener Box */}
            <div className="space-y-2 text-left bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Send an Icebreaker ✨
              </label>
              <input
                type="text"
                value={matchOpenerText}
                onChange={(e) => setMatchOpenerText(e.target.value)}
                placeholder="Say something charming..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-all"
              />

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Hey! It's a match ✨",
                  "Coffee or chai? ☕",
                  "Loved your profile vibe! ✨",
                  "Hey there! How's your day? 😊",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setMatchOpenerText(chip)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500/20 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  const textToSend = (matchOpenerText || "Hey! It's a match ✨ Nice to connect with you!").trim();
                  const convId = mutualMatchPopup.conversationId || mutualMatchPopup.partnerId || mutualMatchPopup.id;
                  const currentUserId = user?._id || user?.id;
                  const partnerId = mutualMatchPopup.partnerId || mutualMatchPopup.partnerUserId || mutualMatchPopup.id;

                  if (convId && textToSend) {
                    socketService.emitSendMessage({
                      conversationId: String(convId).replace(/^conv_/, ""),
                      chatId: String(convId).replace(/^conv_/, ""),
                      roomId: String(convId).replace(/^conv_/, ""),
                      sender: currentUserId,
                      senderId: currentUserId,
                      receiver: partnerId,
                      receiverId: partnerId,
                      recipientId: partnerId,
                      content: textToSend,
                      text: textToSend,
                      message: textToSend,
                      createdAt: new Date().toISOString(),
                    });
                  }

                  setMutualMatchPopup(null);
                  router.push(`/user/matches?id=${convId || ""}&msg=${encodeURIComponent(textToSend)}`);
                }}
                className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm poppins-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Message & Chat</span>
              </button>
              <button
                onClick={() => setMutualMatchPopup(null)}
                className="w-full py-2 rounded-2xl text-xs poppins-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDiscoveryPage() {
  return (
    <Suspense fallback={<DiscoveryRadarLoader userAvatar={null} />}>
      <DiscoveryContent />
    </Suspense>
  );
}


