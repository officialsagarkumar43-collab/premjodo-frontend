"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchMatches } from "@/lib/common/api";
import matchService from "@/lib/services/match.service";
import chatService from "@/lib/services/chat.service";
import socketService from "@/lib/services/socket.service";
import authService from "@/lib/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { formatConversationDateTime, formatTimeAgo, formatLastActive, cn } from "@/lib/common/utils";
import {
  Sparkles,
  MessageCircle,
  Video,
  Phone,
  Search,
  ArrowLeft,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  Coffee,
  Music,
  Trash2,
  Heart,
  UserCheck,
  UserX,
  Info,
  MapPin,
  Briefcase,
  GraduationCap,
  X,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CallModel } from "@/components/chat/CallModel";
import { IncomingCallModal } from "@/components/chat/IncomingCallModal";
import VoiceMessagePlayer from "@/components/chat/VoiceMessagePlayer";
import VoiceMessageRecorder from "@/components/chat/VoiceMessageRecorder";
import { callSoundService } from "@/lib/services/callSound.service";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

// Pre-seeded default chat messages
const ariaChat = [
  {
    id: "1",
    sender: "them",
    text: "Hey there! Loved that indie playlist recommendation 🎶",
    time: "1:40 PM",
    status: "read",
  },
  {
    id: "2",
    sender: "me",
    text: "Hey Aria! So glad you liked it. Found any new favorite tracks?",
    time: "1:42 PM",
    status: "read",
  },
  {
    id: "3",
    sender: "them",
    text: "Yes! That acoustic cover is on loop. Are we still grabbing coffee this weekend? ☕",
    time: "1:45 PM",
    status: "read",
  },
];

const zaraChat = [
  {
    id: "1",
    sender: "them",
    text: "Have you visited that new architecture exhibition yet?",
    time: "Yesterday",
    status: "read",
  },
  {
    id: "2",
    sender: "me",
    text: "Not yet! Planning to check it out this Saturday. Have you?",
    time: "Yesterday",
    status: "read",
  },
  {
    id: "3",
    sender: "them",
    text: "Yes, it was incredible! You're going to love the minimalist gallery space ✨",
    time: "10:15 AM",
    status: "read",
  },
];

const defaultChatHistories = {
  "65a100000000000000000001": ariaChat,
  "65a100000000000000000003": zaraChat,
  "65b100000000000000000001": ariaChat,
  "65b100000000000000000002": zaraChat,
  usr_1: ariaChat,
  usr_3: zaraChat,
};

function MatchesSkeletonLoader() {
  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 overflow-hidden flex select-none">
      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 h-full animate-pulse">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-36 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="w-16 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {/* Search bar */}
          <div className="w-full h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        </div>

        {/* Stories / New Matches (Desktop / Tablet only) */}
        <div className="hidden md:block px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
          <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-10 h-2.5 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800 ml-1 mb-2" />
          <div className="flex items-center gap-3 p-3 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-10 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-3/4 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Area (Desktop) */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-50/80 dark:bg-zinc-950 h-full relative">
        {/* Chat Header Skeleton */}
        <div className="h-16 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-1.5">
              <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Clean Chatbox (no message bubbles skeleton) */}
        <div className="flex-1" />
      </div>
    </div>
  );
}

function MatchesAndChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedId = searchParams.get("id");
  const requestedMsg = searchParams.get("msg");
  const { user, profile } = useAuth();

  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistories, setChatHistories] = useState({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPartnerProfileModal, setShowPartnerProfileModal] = useState(false);
  const [partnerModalPhotoIndex, setPartnerModalPhotoIndex] = useState(0);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenTimestamps, setLastSeenTimestamps] = useState(new Map());
  const [, setTicker] = useState(0);

  const messagesEndRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Keyboard navigation for partner profile photo modal
  useEffect(() => {
    if (!showPartnerProfileModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPartnerProfileModal(false);
      } else if (e.key === "ArrowLeft") {
        const total = Array.isArray(activeMatch?.photos) ? activeMatch.photos.length : 1;
        setPartnerModalPhotoIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === "ArrowRight") {
        const total = Array.isArray(activeMatch?.photos) ? activeMatch.photos.length : 1;
        setPartnerModalPhotoIndex((prev) => (prev + 1) % total);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPartnerProfileModal, activeMatch]);

  const handlePhotoTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handlePhotoTouchEnd = (e, total) => {
    if (touchStartXRef.current === null || total <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped Left -> Next Photo
        setPartnerModalPhotoIndex((prev) => (prev + 1) % total);
      } else {
        // Swiped Right -> Prev Photo
        setPartnerModalPhotoIndex((prev) => (prev - 1 + total) % total);
      }
    }
    touchStartXRef.current = null;
  };

  const openPartnerModal = () => {
    setPartnerModalPhotoIndex(0);
    setShowPartnerProfileModal(true);
  };

  // Dynamic status updater ticker - re-renders every 10s to dynamically tick ("just now" -> "1m ago" -> "2m ago")
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Initialize socket for real-time chat, incoming calls & online status
  useEffect(() => {
    const currentUserId = user?._id || user?.id;
    if (currentUserId) {
      socketService.connect(currentUserId);
    }

    const unsubIncoming = socketService.onIncomingCall((callData) => {
      setIncomingCall(callData);
    });

    const unsubCallEnded = socketService.onCallEnded(() => {
      setIncomingCall(null);
      setActiveCall(null);
    });

    const unsubOnline = socketService.onOnlineUsersChange((usersList, usersSet, lastSeen) => {
      setOnlineUsers(new Set(usersSet));
      if (lastSeen) {
        setLastSeenTimestamps(new Map(lastSeen));
      }
    });

    return () => {
      if (unsubIncoming) unsubIncoming();
      if (unsubCallEnded) unsubCallEnded();
      if (unsubOnline) unsubOnline();
    };
  }, [user]);

  const isPartnerOnline = (matchItem) => {
    if (!matchItem) return false;
    const pId = String(matchItem.partnerUserId || matchItem.partner?._id || matchItem.userId || "").trim();
    if (!pId || pId.startsWith("conv_") || pId.startsWith("usr_") || pId.length < 10) return false;
    return Boolean(onlineUsers.has(pId));
  };

  const getPartnerStatusText = (matchItem) => {
    if (!matchItem) return "Offline";
    if (isPartnerOnline(matchItem)) return "Active now";
    const pId = String(matchItem.partnerUserId || matchItem.partner?._id || matchItem.userId || "").trim();
    const realTimeLastSeen = pId ? lastSeenTimestamps.get(pId) || socketService.getUserLastSeen(pId) : null;
    const lastSeenDate = realTimeLastSeen || matchItem.lastActiveAt;
    return formatLastActive(lastSeenDate);
  };

  // Load matches & conversations from backend
  useEffect(() => {
    async function loadData() {
      setIsLoadingMatches(true);
      try {
        const [backendMatches, backendConversations] = await Promise.all([
          matchService.getMatches(),
          chatService.getConversations(),
        ]);

        const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
        const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;

        const myIds = new Set(
          [
            user?._id,
            user?.id,
            user?.userId,
            profile?._id,
            profile?.userId,
            profile?.user?._id,
            profile?.user,
            storedUser?._id,
            storedUser?.id,
            storedUser?.userId,
            storedProfile?._id,
            storedProfile?.userId,
            storedProfile?.user?._id,
            storedProfile?.user,
          ]
            .filter(Boolean)
            .map(String)
        );

        const myEmails = new Set(
          [
            user?.email,
            profile?.email,
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
            profile?.fullName,
            profile?.firstName,
            storedUser?.name,
            storedUser?.fullName,
            storedProfile?.fullName,
            storedProfile?.firstName,
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
            // If no ID is available to disambiguate and name matches exactly
            if (!entityId || entityId.length < 10) return true;
          }

          return false;
        };

        const seenPartners = new Set();
        const combinedMatches = [];

        // Helper to extract real partner user details
        const getPartnerData = (item) => {
          let partner = null;
          let prof = item.partnerProfile || item.profile || {};

          // Check if item.partner exists and is NOT the current user
          if (item.partner && !isCurrentUser(item.partner)) {
            partner = item.partner;
          } else if (item.partnerUserId && !myIds.has(String(item.partnerUserId))) {
            partner = { _id: String(item.partnerUserId) };
          }

          // Extract from participants array in conversation (find the one that is NOT the current user)
          if ((!partner || !partner._id) && Array.isArray(item.participants)) {
            const otherParticipant = item.participants.find((p) => !isCurrentUser(p));
            if (otherParticipant) {
              partner = typeof otherParticipant === "object" ? otherParticipant : { _id: String(otherParticipant) };
              if (typeof otherParticipant === "object" && otherParticipant.profile) {
                prof = { ...prof, ...otherParticipant.profile };
              }
            }
          }

          // Extract from sender / receiver in match document
          if ((!partner || !partner._id) && item.sender && item.receiver) {
            if (isCurrentUser(item.sender)) {
              partner = typeof item.receiver === "object" ? item.receiver : { _id: String(item.receiver?._id || item.receiver) };
              if (item.receiver?.profile) prof = { ...prof, ...item.receiver.profile };
            } else {
              partner = typeof item.sender === "object" ? item.sender : { _id: String(item.sender?._id || item.sender) };
              if (item.sender?.profile) prof = { ...prof, ...item.sender.profile };
            }
          }

          // If partner is still self or null, discard
          if (!partner || isCurrentUser(partner)) return null;
          const partnerId = partner._id ? String(partner._id) : null;
          if (partnerId && myIds.has(partnerId)) return null;

          const userName =
            partner?.fullName ||
            partner?.name ||
            prof?.fullName ||
            prof?.firstName ||
            "";

          // If no valid partner name is found or if user name matches own user name, skip
          if (!userName) return null;
          if (myNames.has(userName.trim().toLowerCase()) && (partnerId ? myIds.has(partnerId) : true)) {
            return null;
          }

          const photo = resolveImageUrl(
            prof.photos?.[0]?.url ||
            prof.photos?.[0] ||
            prof.photo ||
            partner?.avatar,
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
          );

          const lastActiveAt =
            partner?.lastActive ||
            partner?.lastSeen ||
            partner?.lastActiveAt ||
            prof?.user?.lastActive ||
            prof?.lastActive ||
            prof?.lastSeen ||
            prof?.lastActiveAt ||
            null;

          const age = prof?.age || partner?.age || (prof?.dateOfBirth ? (new Date().getFullYear() - new Date(prof.dateOfBirth).getFullYear()) : null) || 24;
          const bio = prof?.bio || "Hey! Looking to meet genuine and interesting people on Prem Jodo ✨";
          const city = prof?.location?.city || prof?.city || prof?.location?.address || "Nearby";
          const occupation = prof?.profession || prof?.occupation || prof?.jobTitle || "Professional";
          const education = prof?.education || "Graduate";
          const lookingFor = prof?.relationshipIntent || prof?.lookingFor || "Long-term Relationship";
          const interests = Array.isArray(prof?.interests) && prof.interests.length > 0
            ? prof.interests
            : ["Coffee", "Travel", "Music", "Photography", "Fitness"];
          let rawPhotos = prof?.photos || partner?.photos || item?.partnerProfile?.photos || item?.profile?.photos || [];
          if (typeof rawPhotos === "string") rawPhotos = [rawPhotos];
          if (!Array.isArray(rawPhotos)) rawPhotos = [];

          let photos = rawPhotos
            .map((p) => {
              if (!p) return null;
              if (typeof p === "string") return resolveImageUrl(p);
              return resolveImageUrl(p.url || p.secure_url || p.path || p.src || p);
            })
            .filter(Boolean);

          if (photo && !photos.includes(photo)) {
            photos.unshift(photo);
          }

          if (photos.length === 0) {
            photos = [photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"];
          }

          return {
            partnerId: partnerId || null,
            userName,
            photo,
            photos,
            age,
            bio,
            city,
            occupation,
            education,
            lookingFor,
            interests,
            isVerified: Boolean(partner?.isVerified || prof?.isVerified || true),
            lastActiveAt,
            profile: prof,
          };
        };

        if (Array.isArray(backendMatches) && backendMatches.length > 0) {
          backendMatches.forEach((m) => {
            const pData = getPartnerData(m);
            if (!pData) return; // Ignore invalid / self entries

            const partnerKey = pData.partnerId || String(m._id);
            if (!seenPartners.has(partnerKey)) {
              seenPartners.add(partnerKey);
              combinedMatches.push({
                id: m._id || pData.partnerId,
                conversationId: m.conversation?._id || m._id,
                userName: pData.userName,
                userAvatar: pData.photo,
                photos: pData.photos,
                age: pData.age,
                bio: pData.bio,
                city: pData.city,
                occupation: pData.occupation,
                education: pData.education,
                lookingFor: pData.lookingFor,
                interests: pData.interests,
                isVerified: pData.isVerified,
                lastMessage: "It's a match! Say hello ✨",
                matchedAt: m.matchedAt || new Date().toISOString(),
                lastActiveAt: pData.lastActiveAt,
                unreadCount: 0,
                unread: false,
                partnerUserId: pData.partnerId,
              });
            }
          });
        }

        if (Array.isArray(backendConversations) && backendConversations.length > 0) {
          const currentUserId = user?._id || user?.id;
          backendConversations.forEach((conv) => {
            const pData = getPartnerData(conv);
            if (!pData) return; // Ignore invalid / self entries

            const partnerKey = pData.partnerId || String(conv._id);

            // If partner already exists in combinedMatches, update conversation details
            const existingIdx = combinedMatches.findIndex(
              (m) =>
                (pData.partnerId && String(m.partnerUserId) === String(pData.partnerId)) ||
                String(m.id) === String(conv._id) ||
                String(m.conversationId) === String(conv._id)
            );

            const latestMsgTime = conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt;
            const lastMsgSenderId = conv.lastMessage?.sender?._id || conv.lastMessage?.sender;
            const isLastMsgFromMe = lastMsgSenderId && currentUserId && (String(lastMsgSenderId) === String(currentUserId));

            let unreadCnt = 0;
            let isUnread = false;

            if (isLastMsgFromMe) {
              unreadCnt = 0;
              isUnread = false;
            } else if (typeof conv.unreadCount === "number" && conv.unreadCount > 0) {
              unreadCnt = conv.unreadCount;
              isUnread = true;
            } else if (conv.lastMessage && !isLastMsgFromMe) {
              if (conv.lastMessage.isRead === false) {
                unreadCnt = Math.max(conv.unreadCount || 0, 1);
                isUnread = true;
              } else if (conv.lastMessage.isRead === true) {
                unreadCnt = 0;
                isUnread = false;
              }
            } else {
              unreadCnt = conv.unreadCount || 0;
              isUnread = Boolean(conv.unread);
            }

            if (existingIdx !== -1) {
              combinedMatches[existingIdx].conversationId = conv._id;
              if (pData.lastActiveAt) {
                combinedMatches[existingIdx].lastActiveAt = pData.lastActiveAt;
              }
              if (pData.photos) combinedMatches[existingIdx].photos = pData.photos;
              if (pData.age) combinedMatches[existingIdx].age = pData.age;
              if (pData.bio) combinedMatches[existingIdx].bio = pData.bio;
              if (pData.city) combinedMatches[existingIdx].city = pData.city;
              if (pData.occupation) combinedMatches[existingIdx].occupation = pData.occupation;
              if (pData.education) combinedMatches[existingIdx].education = pData.education;
              if (pData.lookingFor) combinedMatches[existingIdx].lookingFor = pData.lookingFor;
              if (pData.interests) combinedMatches[existingIdx].interests = pData.interests;
              if (conv.lastMessage?.content || conv.lastMessage?.text) {
                combinedMatches[existingIdx].lastMessage = conv.lastMessage.content || conv.lastMessage.text;
              }
              if (latestMsgTime) {
                combinedMatches[existingIdx].lastMessageTime = latestMsgTime;
                combinedMatches[existingIdx].matchedAt = latestMsgTime;
              }
              combinedMatches[existingIdx].unreadCount = unreadCnt;
              combinedMatches[existingIdx].unread = isUnread;
              if (Array.isArray(conv.messages)) {
                combinedMatches[existingIdx].messages = conv.messages;
              }
            } else if (!seenPartners.has(partnerKey)) {
              seenPartners.add(partnerKey);
              combinedMatches.push({
                id: conv._id,
                conversationId: conv._id,
                userName: pData.userName,
                userAvatar: pData.photo,
                photos: pData.photos,
                age: pData.age,
                bio: pData.bio,
                city: pData.city,
                occupation: pData.occupation,
                education: pData.education,
                lookingFor: pData.lookingFor,
                interests: pData.interests,
                isVerified: pData.isVerified,
                lastMessage: conv.lastMessage?.content || conv.lastMessage?.text || "Say hello ✨",
                matchedAt: latestMsgTime,
                lastMessageTime: latestMsgTime,
                lastActiveAt: pData.lastActiveAt,
                unreadCount: unreadCnt,
                unread: isUnread,
                partnerUserId: pData.partnerId,
                messages: Array.isArray(conv.messages) ? conv.messages : [],
              });
            }
          });
        }

        setMatches(combinedMatches);
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(
              new CustomEvent("pj-matches-updated", {
                detail: { count: combinedMatches.length },
              })
            );
          } catch {}
        }

        if (requestedId) {
          const foundIdx = combinedMatches.findIndex(
            (m) =>
              String(m.id) === String(requestedId) ||
              String(m.conversationId) === String(requestedId) ||
              (m.partnerUserId && String(m.partnerUserId) === String(requestedId))
          );
          if (foundIdx !== -1) {
            combinedMatches[foundIdx].unread = false;
            combinedMatches[foundIdx].unreadCount = 0;
            setMatches([...combinedMatches]);
            setActiveMatch(combinedMatches[foundIdx]);
            return;
          }
        }

        if (combinedMatches.length > 0 && !activeMatch && typeof window !== "undefined" && window.innerWidth >= 1024) {
          combinedMatches[0].unread = false;
          combinedMatches[0].unreadCount = 0;
          setMatches([...combinedMatches]);
          setActiveMatch(combinedMatches[0]);
        } else {
          setMatches(combinedMatches);
        }
      } catch (err) {
        console.warn("Failed to load matches from backend:", err?.message || err);
      } finally {
        setIsLoadingMatches(false);
      }
    }
    loadData();
  }, [user?._id, user?.id]);

  // Handle switching active match on requestedId change without reloading skeleton
  useEffect(() => {
    if (!requestedId || matches.length === 0) return;
    const foundIdx = matches.findIndex(
      (m) =>
        String(m.id) === String(requestedId) ||
        String(m.conversationId) === String(requestedId) ||
        (m.partnerUserId && String(m.partnerUserId) === String(requestedId))
    );
    if (foundIdx !== -1) {
      setMatches((prev) =>
        prev.map((m, idx) =>
          idx === foundIdx ? { ...m, unread: false, unreadCount: 0 } : m
        )
      );
      setActiveMatch(matches[foundIdx]);
    }
  }, [requestedId]);

  // Load messages once per unique conversationId change
  const activeConversationId = activeMatch?.conversationId || activeMatch?.id;
  const lastLoadedConvRef = useRef(null);

  useEffect(() => {
    if (!activeConversationId) return;
    if (lastLoadedConvRef.current === activeConversationId) return;
    lastLoadedConvRef.current = activeConversationId;

    // Immediately mark active conversation as read in local matches state
    setMatches((prev) =>
      prev.map((m) => {
        const mId = String(m.id || "").trim();
        const mConv = String(m.conversationId || "").trim();
        const cur = String(activeConversationId).trim();
        const curClean = cur.replace(/^conv_/, "");
        if (mId === cur || mConv === cur || mId === curClean || mConv === curClean) {
          return { ...m, unread: false, unreadCount: 0 };
        }
        return m;
      })
    );

    socketService.joinChat(activeConversationId);
    chatService.markAsRead(activeConversationId);

    async function loadConversationMessages() {
      if (!activeMatch?.messages || activeMatch.messages.length === 0) {
        setIsLoadingMessages(true);
      }
      try {
        const msgs = (Array.isArray(activeMatch?.messages) && activeMatch.messages.length > 0)
          ? activeMatch.messages
          : await chatService.getMessages(activeConversationId);
        if (Array.isArray(msgs) && msgs.length > 0) {
          // Deduplicate by message ID
          const seen = new Set();
          const formatted = [];
          for (const m of msgs) {
            const id = String(m._id || m.id || Math.random());
            if (!seen.has(id)) {
              seen.add(id);
              const currentUserId = user?._id || user?.id;
              const senderId = m.sender?._id || m.sender || m.senderId;
              const isMe = String(senderId) === String(currentUserId);
              formatted.push({
                id,
                sender: isMe ? "me" : "them",
                text: m.content || m.text || m.message || "",
                mediaUrl: m.mediaUrl || null,
                mediaType: m.mediaType || (m.mediaUrl ? "audio" : null),
                duration: m.duration || null,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
                status: m.isRead ? "read" : "sent",
              });
            }
          }

          if (requestedMsg && !formatted.some((m) => m.text === requestedMsg)) {
            formatted.push({
              id: `init_${Date.now()}`,
              sender: "me",
              text: requestedMsg,
              time: "Just now",
              status: "sent",
            });
          }

          setChatHistories((prev) => ({
            ...prev,
            [activeConversationId]: formatted,
            ...(activeMatch?.id ? { [activeMatch.id]: formatted } : {}),
          }));
        } else if (requestedMsg) {
          const initialItem = {
            id: `init_${Date.now()}`,
            sender: "me",
            text: requestedMsg,
            time: "Just now",
            status: "sent",
          };
          setChatHistories((prev) => ({
            ...prev,
            [activeConversationId]: [initialItem],
            ...(activeMatch?.id ? { [activeMatch.id]: [initialItem] } : {}),
          }));
        } else {
          setChatHistories((prev) => ({
            ...prev,
            [activeConversationId]: [],
            ...(activeMatch?.id ? { [activeMatch.id]: [] } : {}),
          }));
        }
      } catch (err) {
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadConversationMessages();

    return () => {
      socketService.leaveChat(activeConversationId);
    };
  }, [activeConversationId, user?._id, user?.id]);

  // Real-time socket message listener for all conversations
  useEffect(() => {
    const unsubscribe = socketService.onMessageReceived((newMsg) => {
      if (!newMsg) return;
      const currentUserId = user?._id || user?.id;
      const senderId = String(
        newMsg.sender?._id ||
        newMsg.sender?.id ||
        (typeof newMsg.sender === "string" ? newMsg.sender : "") ||
        newMsg.senderId ||
        newMsg.from ||
        newMsg.userId ||
        ""
      ).trim();
      const receiverId = String(
        newMsg.receiver?._id ||
        newMsg.receiver?.id ||
        (typeof newMsg.receiver === "string" ? newMsg.receiver : "") ||
        newMsg.receiverId ||
        newMsg.recipientId ||
        newMsg.to ||
        ""
      ).trim();
      const isMe = currentUserId && String(senderId) === String(currentUserId);
      const text = String(
        (typeof newMsg === "string" ? newMsg : "") ||
        newMsg.content ||
        newMsg.text ||
        (typeof newMsg.message === "string" ? newMsg.message : "") ||
        newMsg.body ||
        newMsg.msg ||
        ""
      ).trim();
      const msgId = String(newMsg._id || newMsg.id || newMsg.messageId || "");
      const rawConvId = String(
        newMsg.conversationId ||
        newMsg.conversation?._id ||
        (typeof newMsg.conversation === "string" ? newMsg.conversation : "") ||
        newMsg.chatId ||
        newMsg.chat?._id ||
        newMsg.roomId ||
        newMsg.room ||
        ""
      ).trim();
      const cleanConvId = rawConvId.replace(/^conv_/, "");
      const msgTime = newMsg.createdAt || newMsg.timestamp || new Date().toISOString();

      if (!text && !newMsg.mediaUrl) return;

      const incomingItem = {
        id: msgId || `sock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sender: isMe ? "me" : "them",
        text,
        mediaUrl: newMsg.mediaUrl || null,
        mediaType: newMsg.mediaType || (newMsg.mediaUrl ? "audio" : null),
        duration: newMsg.duration || null,
        time: new Date(msgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: isMe ? (newMsg.status === "read" || newMsg.isRead ? "read" : (newMsg.status || "delivered")) : (newMsg.status || "delivered"),
      };

      // 1. Update chat history for all matching keys
      setChatHistories((prev) => {
        const next = { ...prev };
        const keysToUpdate = new Set();
        if (rawConvId) keysToUpdate.add(rawConvId);
        if (cleanConvId) keysToUpdate.add(cleanConvId);
        if (senderId) keysToUpdate.add(senderId);
        if (receiverId) keysToUpdate.add(receiverId);

        if (activeMatch) {
          const aId = String(activeMatch.id || "").trim();
          const aConv = String(activeMatch.conversationId || "").trim();
          const aCleanConv = aConv.replace(/^conv_/, "");
          const aPartner = String(activeMatch.partnerUserId || activeMatch.partner?._id || "").trim();

          const isActiveTarget =
            !rawConvId ||
            aConv === rawConvId ||
            aCleanConv === cleanConvId ||
            aId === rawConvId ||
            aId === cleanConvId ||
            (senderId && (aPartner === senderId || aId === senderId)) ||
            (receiverId && (aPartner === receiverId || aId === receiverId));

          if (isActiveTarget) {
            keysToUpdate.add(aId);
            if (aConv) keysToUpdate.add(aConv);
            if (aCleanConv) keysToUpdate.add(aCleanConv);
          }
        }

        matches.forEach((m) => {
          const mId = String(m.id || "").trim();
          const mConv = String(m.conversationId || "").trim();
          const mCleanConv = mConv.replace(/^conv_/, "");
          const mPartner = String(m.partnerUserId || m.partner?._id || "").trim();

          const isMatchTarget =
            (rawConvId && (mConv === rawConvId || mCleanConv === cleanConvId || mId === rawConvId || mId === cleanConvId)) ||
            (senderId && (mPartner === senderId || mId === senderId)) ||
            (receiverId && (mPartner === receiverId || mId === receiverId));

          if (isMatchTarget) {
            keysToUpdate.add(mId);
            if (mConv) keysToUpdate.add(mConv);
            if (mCleanConv) keysToUpdate.add(mCleanConv);
          }
        });

        if (keysToUpdate.size === 0 && activeMatch) {
          keysToUpdate.add(String(activeMatch.id));
        }

        keysToUpdate.forEach((key) => {
          const currentList = next[key] || [];
          if (msgId && currentList.some((item) => item.id === msgId)) {
            return;
          }
          if (isMe) {
            const tempIdx = currentList.findIndex(
              (item) => item.id.startsWith("temp_") && item.text === text
            );
            if (tempIdx !== -1) {
              const updated = [...currentList];
              updated[tempIdx] = {
                ...updated[tempIdx],
                id: msgId || updated[tempIdx].id,
                status: (newMsg.status === "read" || newMsg.isRead) ? "read" : (newMsg.status || "delivered"),
              };
              next[key] = updated;
              return;
            }
          }
          next[key] = [...currentList, incomingItem];
        });

        return next;
      });

      // 2. Update activeMatch preview if currently viewing this chat
      if (activeMatch) {
        const aId = String(activeMatch.id || "").trim();
        const aConv = String(activeMatch.conversationId || "").trim();
        const aPartner = String(activeMatch.partnerUserId || activeMatch.partner?._id || "").trim();
        const isCurrentActive =
          (rawConvId && (aConv === rawConvId || aConv.replace(/^conv_/, "") === cleanConvId || aId === rawConvId)) ||
          (senderId && (aPartner === senderId || aId === senderId));

        if (isCurrentActive) {
          setActiveMatch((prev) => (prev ? { ...prev, lastMessage: text, lastMessageTime: msgTime } : prev));
        }
      }

      // 3. Play subtle throttled audio ping for incoming message from partner (single sound guarantee)
      if (!isMe && typeof window !== "undefined") {
        callSoundService.playMessageNotification(msgId || `${senderId}_${text}`);
      }

      // 4. Update sidebar conversation preview & dynamically add new conversation if missing
      setMatches((prev) => {
        let matchedFound = false;
        const updated = prev.map((m) => {
          const mId = String(m.id || "").trim();
          const mConv = String(m.conversationId || "").trim();
          const mPartner = String(m.partnerUserId || m.partner?._id || "").trim();

          const isTarget =
            (rawConvId && (mConv === rawConvId || mConv.replace(/^conv_/, "") === cleanConvId || mId === rawConvId || mId === cleanConvId)) ||
            (senderId && (mPartner === senderId || mId === senderId)) ||
            (receiverId && (mPartner === receiverId || mId === receiverId));

          if (isTarget) {
            matchedFound = true;
            const isCurrentlyOpen = activeMatch && (String(activeMatch.id) === mId || String(activeMatch.conversationId) === mConv);
            const isUnread = !isCurrentlyOpen && !isMe;
            return {
              ...m,
              lastMessage: text,
              lastMessageTime: msgTime,
              matchedAt: msgTime,
              unread: isUnread ? true : (isCurrentlyOpen ? false : Boolean(m.unread)),
              unreadCount: isUnread ? ((m.unreadCount || 0) + 1) : (isCurrentlyOpen ? 0 : (m.unreadCount || 0)),
            };
          }
          return m;
        });

        if (!matchedFound) {
          const newPartnerName = newMsg.senderName || (isMe ? "Match Partner" : (newMsg.sender?.fullName || newMsg.sender?.name || "New Match"));
          const newPartnerPhoto = newMsg.senderPhoto || newMsg.sender?.avatar || newMsg.sender?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
          const newConvId = cleanConvId || rawConvId || `conv_${Date.now()}`;
          const newPartnerId = isMe ? receiverId : senderId;
          const isCurrentlyOpen = activeMatch && String(activeMatch.conversationId) === String(newConvId);
          const isUnread = !isCurrentlyOpen && !isMe;

          const newMatchItem = {
            id: newConvId,
            conversationId: newConvId,
            name: newPartnerName,
            userName: newPartnerName,
            avatar: newPartnerPhoto,
            photo: newPartnerPhoto,
            userAvatar: newPartnerPhoto,
            lastMessage: text,
            lastMessageTime: msgTime,
            matchedAt: msgTime,
            partnerUserId: newPartnerId,
            isOnline: socketService.isUserOnline(newPartnerId),
            unread: isUnread,
            unreadCount: isUnread ? 1 : 0,
          };
          updated.unshift(newMatchItem);

          if (!activeMatch) {
            setActiveMatch(newMatchItem);
          }
        }

        updated.sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || a.matchedAt || 0).getTime();
          const timeB = new Date(b.lastMessageTime || b.matchedAt || 0).getTime();
          return timeB - timeA;
        });

        if (typeof window !== "undefined") {
          try {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("pj-matches-updated", { detail: { count: updated.length } }));
            }, 0);
          } catch {}
        }

        return updated;
      });
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
          name: partnerName,
          userName: partnerName,
          avatar: partnerPhoto,
          photo: partnerPhoto,
          userAvatar: partnerPhoto,
          lastMessage: data.lastMessage || "It's a match! Say hello ✨",
          lastMessageTime: data.lastMessageTime || new Date().toISOString(),
          matchedAt: data.lastMessageTime || new Date().toISOString(),
          partnerUserId: partnerId,
          isOnline: socketService.isUserOnline(partnerId),
          unread: false,
          unreadCount: 0,
        };
        const next = [item, ...prev];
        if (typeof window !== "undefined") {
          try {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("pj-matches-updated", { detail: { count: next.length } }));
            }, 0);
          } catch {}
        }
        return next;
      });
    });

    const unsubConv = socketService.onConversationUpdated((data) => {
      if (!data) return;
      const convId = String(data.conversationId || data.conversation?._id || data.conversation || "");
      const cleanId = convId.replace(/^conv_/, "");
      const lastMsgText = data.lastMessage?.content || data.lastMessage?.text || data.lastMessage?.message || "";
      const updateTime = data.updatedAt || data.lastMessage?.createdAt || new Date().toISOString();

      if (convId && lastMsgText) {
        setMatches((prev) =>
          prev.map((m) => {
            if (String(m.conversationId) === convId || String(m.conversationId).replace(/^conv_/, "") === cleanId || String(m.id) === convId) {
              return {
                ...m,
                lastMessage: lastMsgText,
                lastMessageTime: updateTime,
                matchedAt: updateTime,
              };
            }
            return m;
          })
        );
      }
    });

    const unsubTyping = socketService.onTyping((data) => {
      if (!data || !activeMatch) return;
      const activeConv = String(activeMatch.conversationId || activeMatch.id || "").replace(/^conv_/, "");
      const partnerId = String(activeMatch.partnerUserId || activeMatch.partner?._id || activeMatch.userId || "").trim();
      const dataConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const senderId = String(data.senderId || data.userId || data.from || "").trim();

      const isForActive =
        (activeConv && dataConv && activeConv === dataConv) ||
        (partnerId && senderId && partnerId === senderId);

      if (isForActive) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3500);
      }
    });

    const unsubStopTyping = socketService.onStopTyping((data) => {
      if (!data || !activeMatch) return;
      const activeConv = String(activeMatch.conversationId || activeMatch.id || "").replace(/^conv_/, "");
      const partnerId = String(activeMatch.partnerUserId || activeMatch.partner?._id || activeMatch.userId || "").trim();
      const dataConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const senderId = String(data.senderId || data.userId || data.from || "").trim();

      const isForActive =
        (activeConv && dataConv && activeConv === dataConv) ||
        (partnerId && senderId && partnerId === senderId);

      if (isForActive) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
      }
    });

    const unsubRead = socketService.onReadReceipt((data) => {
      if (!data) return;
      const readConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const readerId = String(data.readerId || data.userId || "").trim();
      const currentUserId = String(user?._id || user?.id || "").trim();

      // If the reader is ME, ignore (I am the one reading partner's messages, not partner reading my messages)
      if (readerId && currentUserId && readerId === currentUserId) {
        return;
      }

      setChatHistories((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        Object.keys(next).forEach((key) => {
          const cleanKey = key.replace(/^conv_/, "");
          const isTarget =
            (readConv && (key === readConv || cleanKey === readConv)) ||
            (readerId && key === readerId);

          if (isTarget && Array.isArray(next[key])) {
            const updated = next[key].map((m) => {
              if (m.sender === "me" && m.status !== "read") {
                hasChanges = true;
                return { ...m, status: "read", isRead: true };
              }
              return m;
            });
            if (hasChanges) {
              next[key] = updated;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubNewMatch) unsubNewMatch();
      if (unsubConv) unsubConv();
      if (unsubTyping) unsubTyping();
      if (unsubStopTyping) unsubStopTyping();
      if (unsubRead) unsubRead();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    };
  }, [activeMatch, user, matches]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const currentMessages = activeMatch
    ? Array.isArray(chatHistories[activeMatch.id])
      ? chatHistories[activeMatch.id]
      : Array.isArray(chatHistories[activeMatch.conversationId])
      ? chatHistories[activeMatch.conversationId]
      : Array.isArray(chatHistories[String(activeMatch.conversationId).replace(/^conv_/, "")])
      ? chatHistories[String(activeMatch.conversationId).replace(/^conv_/, "")]
      : Array.isArray(chatHistories[activeMatch.partnerUserId])
      ? chatHistories[activeMatch.partnerUserId]
      : []
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping, activeMatch]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSelectMatch = (match) => {
    const updatedMatch = { ...match, unread: false, unreadCount: 0 };
    setActiveMatch(updatedMatch);
    setMatches((prev) =>
      prev.map((m) => {
        const isThisMatch =
          String(m.id) === String(match.id) ||
          String(m.conversationId) === String(match.conversationId) ||
          (m.partnerUserId && match.partnerUserId && String(m.partnerUserId) === String(match.partnerUserId));
        return isThisMatch ? { ...m, unread: false, unreadCount: 0 } : m;
      })
    );
    const convId = match.conversationId || match.id;
    const cleanConv = String(convId).replace(/^conv_/, "");
    const currentUserId = user?._id || user?.id;
    socketService.emitMarkRead({
      conversationId: cleanConv,
      readerId: currentUserId,
      senderId: match.partnerUserId,
    });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/user/matches?id=${match.id || match.conversationId}`);
    }
  };

    const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (!activeMatch) return;
    const conversationId = String(activeMatch.conversationId || activeMatch.id || "");
    const cleanConvId = conversationId.replace(/^conv_/, "");
    const partnerId = String(activeMatch.partnerUserId || activeMatch.partner?._id || activeMatch.userId || "");
    const currentUserId = user?._id || user?.id;

    if (val.trim()) {
      socketService.emitTyping({
        conversationId: cleanConvId,
        receiverId: partnerId,
        senderId: currentUserId,
      });

      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        socketService.emitStopTyping({
          conversationId: cleanConvId,
          receiverId: partnerId,
          senderId: currentUserId,
        });
      }, 1500);
    } else {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      socketService.emitStopTyping({
        conversationId: cleanConvId,
        receiverId: partnerId,
        senderId: currentUserId,
      });
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !activeMatch) return;

    const matchId = String(activeMatch.id || "");
    const conversationId = String(activeMatch.conversationId || activeMatch.id || "");
    const cleanConvId = conversationId.replace(/^conv_/, "");
    const partnerId = String(activeMatch.partnerUserId || activeMatch.partner?._id || activeMatch.userId || "");
    const currentUserId = user?._id || user?.id;

    // Immediately stop typing indicator on send
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    socketService.emitStopTyping({
      conversationId: cleanConvId,
      receiverId: partnerId,
      senderId: currentUserId,
    });

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newMessage = {
      id: tempId,
      sender: "me",
      text: trimmed,
      time: getCurrentTime(),
      status: "sent",
    };

    // Instant optimistic update across all possible chat keys
    const targetKeys = new Set([matchId, conversationId, cleanConvId, partnerId].filter(Boolean));

    setChatHistories((prev) => {
      const next = { ...prev };
      let existingList = [];
      for (const k of targetKeys) {
        if (Array.isArray(next[k]) && next[k].length > 0) {
          existingList = next[k];
          break;
        }
      }
      const updatedList = [...existingList, newMessage];
      targetKeys.forEach((k) => {
        next[k] = updatedList;
      });
      return next;
    });

    // Update activeMatch state & sidebar conversation preview
    setActiveMatch((prev) => (prev ? { ...prev, lastMessage: trimmed, lastMessageTime: new Date().toISOString() } : prev));
    setMatches((prev) =>
      prev.map((m) =>
        String(m.id) === String(matchId) ||
        String(m.conversationId) === String(conversationId) ||
        (cleanConvId && String(m.conversationId).replace(/^conv_/, "") === cleanConvId)
          ? { ...m, lastMessage: trimmed, lastMessageTime: new Date().toISOString(), matchedAt: new Date().toISOString() }
          : m
      )
    );

    setInputText("");
    setShowEmojiPicker(false);

    // Instant WebSocket message dispatch (Zero HTTP POST overhead / AWS cost saving)
    socketService.emitSendMessage({
      conversationId: cleanConvId,
      chatId: cleanConvId,
      roomId: cleanConvId,
      sender: currentUserId,
      senderId: currentUserId,
      receiver: partnerId,
      receiverId: partnerId,
      recipientId: partnerId,
      content: trimmed,
      text: trimmed,
      message: trimmed,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSendVoiceNote = async ({ audioUrl, duration }) => {
    if (!audioUrl || !activeMatch) return;

    const matchId = String(activeMatch.id || "");
    const conversationId = String(activeMatch.conversationId || activeMatch.id || "");
    const cleanConvId = conversationId.replace(/^conv_/, "");
    const partnerId = String(activeMatch.partnerUserId || activeMatch.partner?._id || activeMatch.userId || "");
    const currentUserId = user?._id || user?.id;

    const tempId = `temp_voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const previewText = "🎤 Voice message";
    const newMessage = {
      id: tempId,
      sender: "me",
      text: previewText,
      mediaUrl: audioUrl,
      mediaType: "audio",
      duration: duration || 1,
      time: getCurrentTime(),
      status: "sent",
    };

    // Instant optimistic update across all possible chat keys
    const targetKeys = new Set([matchId, conversationId, cleanConvId, partnerId].filter(Boolean));

    setChatHistories((prev) => {
      const next = { ...prev };
      let existingList = [];
      for (const k of targetKeys) {
        if (Array.isArray(next[k]) && next[k].length > 0) {
          existingList = next[k];
          break;
        }
      }
      const updatedList = [...existingList, newMessage];
      targetKeys.forEach((k) => {
        next[k] = updatedList;
      });
      return next;
    });

    // Update activeMatch state & sidebar conversation preview
    setActiveMatch((prev) => (prev ? { ...prev, lastMessage: previewText, lastMessageTime: new Date().toISOString() } : prev));
    setMatches((prev) =>
      prev.map((m) =>
        String(m.id) === String(matchId) ||
        String(m.conversationId) === String(conversationId) ||
        (cleanConvId && String(m.conversationId).replace(/^conv_/, "") === cleanConvId)
          ? { ...m, lastMessage: previewText, lastMessageTime: new Date().toISOString(), matchedAt: new Date().toISOString() }
          : m
      )
    );

    // Instant WebSocket message dispatch
    socketService.emitSendMessage({
      conversationId: cleanConvId,
      chatId: cleanConvId,
      roomId: cleanConvId,
      sender: currentUserId,
      senderId: currentUserId,
      receiver: partnerId,
      receiverId: partnerId,
      recipientId: partnerId,
      content: previewText,
      text: previewText,
      message: previewText,
      mediaUrl: audioUrl,
      mediaType: "audio",
      duration: duration || 1,
      createdAt: new Date().toISOString(),
    });
  };

  const handleClearMessages = async (targetMatch = activeMatch) => {
    if (!targetMatch) return;
    setShowMenu(false);

    const convId = targetMatch.conversationId || targetMatch.id || targetMatch.partnerUserId;
    const matchId = String(targetMatch.id || "");
    const partnerId = String(targetMatch.partnerUserId || "");
    const cleanConvId = String(convId).replace(/^conv_/, "");

    // Clear from local state immediately
    const targetKeys = [matchId, convId, cleanConvId, partnerId].filter(Boolean);
    setChatHistories((prev) => {
      const copy = { ...prev };
      targetKeys.forEach((k) => {
        copy[k] = [];
      });
      return copy;
    });

    setActiveMatch((prev) => (prev ? { ...prev, lastMessage: "" } : prev));
    setMatches((prev) =>
      prev.map((m) =>
        String(m.id) === matchId ||
        String(m.conversationId) === String(convId) ||
        (cleanConvId && String(m.conversationId).replace(/^conv_/, "") === cleanConvId)
          ? { ...m, lastMessage: "" }
          : m
      )
    );

    // Call backend API to delete conversation messages
    await chatService.clearMessages(convId);
  };

  const handleUnmatch = async (matchToRemove) => {
    if (!matchToRemove) return;
    const matchId = matchToRemove.id || matchToRemove.partnerUserId;
    setShowMenu(false);

    // Remove from UI state immediately
    setMatches((prev) =>
      prev.filter(
        (m) =>
          m.id !== matchToRemove.id &&
          m.conversationId !== matchToRemove.conversationId &&
          m.partnerUserId !== matchToRemove.partnerUserId
      )
    );
    setChatHistories((prev) => {
      const copy = { ...prev };
      delete copy[matchToRemove.id];
      return copy;
    });

    if (activeMatch?.id === matchToRemove.id) {
      setActiveMatch(null);
      router.replace("/user/matches");
    }

    // Call backend service to unmatch/delete
    await matchService.unmatchUser(matchId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const filteredMatches = matches.filter((m) =>
    (m.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickEmojis = ["❤️", "😍", "😊", "☕", "🥂", "🔥", "🌸", "✨", "🎉", "👌"];

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    const callerId = incomingCall.caller?.id || incomingCall.from;
    const channelName = incomingCall.channelName;
    const convId = incomingCall.conversationId || channelName;

    socketService.emitAnswerCall({
      to: callerId,
      channelName,
      conversationId: convId,
    });

    // Find existing match or build dynamic match representation for CallModel
    const existing = matches.find(
      (m) => String(m.partnerUserId) === String(callerId) || String(m.id) === String(convId)
    );

    setActiveMatch(
      existing || {
        id: convId,
        conversationId: convId,
        channelName,
        userName: incomingCall.caller?.name || "Match Partner",
        userAvatar: incomingCall.caller?.avatar || "",
        partnerUserId: callerId,
      }
    );

    setActiveCall(incomingCall.callType || "video");
    setIncomingCall(null);
  };

  const handleRejectIncomingCall = () => {
    if (!incomingCall) return;
    const callerId = incomingCall.caller?.id || incomingCall.from;
    const channelName = incomingCall.channelName;
    const convId = incomingCall.conversationId || channelName;

    socketService.emitEndCall({
      to: callerId,
      channelName,
      conversationId: convId,
    });

    setIncomingCall(null);
  };

  if (isLoadingMatches) {
    return <MatchesSkeletonLoader />;
  }

  return (
    <div className="w-full h-full max-h-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 lg:rounded-2xl overflow-hidden flex flex-1 min-h-0">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Matches & Conversations Sidebar */}
      {/* ============================================================ */}
      <div
        className={cn(
          "w-full lg:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 z-10 transition-all h-full max-h-full min-h-0",
          activeMatch ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/user")}
                className="p-1.5 -ml-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Back to Discover"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl poppins-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-rose-500" />
                Matches & Chats
              </h1>
            </div>
            <span className="text-xs poppins-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              {matches.length} Matches
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches or messages..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs sm:text-sm poppins-regular text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Stories / Recent Matches Horizontal Avatars */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 relative group/stories">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] poppins-semibold uppercase tracking-wider text-zinc-400">
              New Matches
            </h4>
            <span className="text-[10px] text-zinc-500 font-medium">
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </span>
          </div>

          <div
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-3 overflow-x-auto scroll-smooth overscroll-x-contain touch-pan-x no-scrollbar py-2 px-1"
          >
            {matches.map((match) => {
              const isOnline = isPartnerOnline(match);
              const isMatchActive =
                Boolean(activeMatch) &&
                (String(activeMatch.id) === String(match.id) ||
                 String(activeMatch.conversationId) === String(match.conversationId) ||
                 (activeMatch.partnerUserId && match.partnerUserId && String(activeMatch.partnerUserId) === String(match.partnerUserId)));
              return (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group focus:outline-none p-1"
                >
                  <div
                    className={cn(
                      "relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105",
                      isOnline
                        ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400"
                        : "bg-zinc-200 dark:bg-zinc-700/60",
                      isMatchActive && "ring-2 ring-rose-500/40 ring-offset-2 dark:ring-offset-zinc-900"
                    )}
                  >
                    <img
                      src={resolveImageUrl(
                        match.userAvatar,
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                      )}
                      alt={match.userName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                    />
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-zinc-900 rounded-full",
                        isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                      )}
                    />
                  </div>
                  <span className="text-[11px] poppins-medium mt-1.5 text-zinc-700 dark:text-zinc-300 max-w-[56px] truncate">
                    {match.userName.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 pt-2 pb-1">
            <h4 className="text-[11px] poppins-semibold uppercase tracking-wider text-zinc-400">
              Conversations
            </h4>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">No matches found.</div>
          ) : (
            filteredMatches.map((match) => {
              const isSelected =
                Boolean(activeMatch) &&
                (String(activeMatch.id) === String(match.id) ||
                 String(activeMatch.conversationId) === String(match.conversationId) ||
                 (activeMatch.partnerUserId && match.partnerUserId && String(activeMatch.partnerUserId) === String(match.partnerUserId)) ||
                 (activeMatch.id && match.conversationId && String(activeMatch.id) === String(match.conversationId)) ||
                 (activeMatch.conversationId && match.id && String(activeMatch.conversationId) === String(match.id)));
              const isOnline = isPartnerOnline(match);
              const lastHistoryMsg = chatHistories[match.id]?.slice(-1)[0]?.text;
              const preview = lastHistoryMsg || match.lastMessage || "Tap to chat";

              return (
                <div
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border",
                    isSelected
                      ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border-transparent"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={resolveImageUrl(
                        match.userAvatar,
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                      )}
                      alt={match.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-zinc-900 rounded-full",
                        isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={cn(
                          "poppins-semibold text-sm truncate",
                          isSelected
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-zinc-900 dark:text-zinc-100"
                        )}
                      >
                        {match.userName}
                      </h4>
                      {(() => {
                        const { date, time } = formatConversationDateTime(match.lastMessageTime || match.matchedAt);
                        return (
                          <div className="flex flex-col items-end flex-shrink-0 ml-2 leading-tight text-right">
                            <span className="text-[10px] poppins-semibold text-zinc-500 dark:text-zinc-400">
                              {date}
                            </span>
                            {time && (
                              <span className="text-[9px] poppins-regular text-zinc-400 dark:text-zinc-500 mt-0.5">
                                {time}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate poppins-regular flex-1">
                        {preview}
                      </p>
                      {(!isSelected && (match.unread || (match.unreadCount && match.unreadCount > 0))) ? (
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] poppins-bold text-white bg-rose-500 rounded-full flex-shrink-0 animate-pulse shadow-md shadow-rose-500/40">
                          {match.unreadCount && match.unreadCount > 1 ? match.unreadCount : "1"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: Active Chat Conversation View (Full Screen on Mobile) */}
      {/* ============================================================ */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-zinc-50/80 dark:bg-zinc-950 relative overflow-hidden h-full max-h-full min-h-0",
          !activeMatch ? "hidden lg:flex" : "fixed inset-0 z-50 lg:static lg:inset-auto flex w-full h-[100dvh] lg:h-full lg:max-h-full"
        )}
      >
        {activeMatch ? (
          <>
            {/* Top Chat Room Header */}
            <div className="h-16 flex-shrink-0 px-3 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 gap-2 min-w-0 shadow-xs z-10">
              {/* Active Chat Partner Info */}
              <div
                onClick={openPartnerModal}
                className="cursor-pointer flex items-center gap-2 sm:gap-3 flex-1 min-w-0 group"
                title="View full profile"
              >
                {/* Back to matches on mobile */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMatch(null);
                    if (typeof window !== "undefined") {
                      window.history.replaceState(null, "", "/user/matches");
                    }
                  }}
                  className="lg:hidden p-2 -ml-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 flex-shrink-0 cursor-pointer active:scale-95"
                  title="Back to Matches"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative flex-shrink-0">
                  <img
                    src={resolveImageUrl(
                      activeMatch.userAvatar,
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    )}
                    alt={activeMatch.userName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 group-hover:ring-2 group-hover:ring-rose-500/50 transition-all"
                  />
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-zinc-900 rounded-full",
                      isPartnerOnline(activeMatch) ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="poppins-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-500 transition-colors">
                      {activeMatch.userName}
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] poppins-semibold px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex-shrink-0">
                      Match
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs poppins-medium flex items-center gap-1.5 truncate",
                      isPartnerOnline(activeMatch)
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    )}
                  >
                    {isTyping ? (
                      <span className="text-rose-500 animate-pulse font-semibold">typing...</span>
                    ) : isPartnerOnline(activeMatch) ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        <span className="truncate">Active now</span>
                      </>
                    ) : (
                      <span className="truncate">{getPartnerStatusText(activeMatch)}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <button
                  onClick={openPartnerModal}
                  className="hidden md:flex p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="View User Profile"
                >
                  <Info className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveCall("video")}
                  className="hidden md:flex p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Agora Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveCall("audio")}
                  className="hidden md:flex p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Agora Audio Call"
                >
                  <Phone className="w-4.5 h-4.5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    title="Options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 border border-zinc-200 dark:border-zinc-700 text-xs poppins-medium text-zinc-700 dark:text-zinc-200 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          openPartnerModal();
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-rose-500" /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setActiveCall("video");
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-rose-500" /> Start Video Call
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setActiveCall("audio");
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-rose-500" /> Start Audio Call
                      </button>
                      <button
                        onClick={() => handleClearMessages(activeMatch)}
                        className="w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-500" /> Clear Messages
                      </button>
                      <button
                        onClick={() => handleUnmatch(activeMatch)}
                        className="w-full px-4 py-2.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer border-t border-zinc-100 dark:border-zinc-700/60 font-semibold"
                      >
                        <UserX className="w-4 h-4" /> Unmatch & Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-4 space-y-3.5 relative overscroll-contain">
              {!isLoadingMessages && currentMessages.length > 0 && (
                <>
                  {/* Encrypted Notice */}
                  <div className="flex justify-center my-1.5">
                    <div className="flex items-center gap-1.5 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs poppins-medium px-4 py-1.5 rounded-full max-w-sm text-center shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span>Messages & calls are encrypted on Prem Jodo</span>
                    </div>
                  </div>

                  {/* Date Separator */}
                  <div className="flex justify-center my-1">
                    <span className="bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[11px] poppins-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  </div>

                  {/* Message Bubbles */}
                  {currentMessages.map((msg, idx) => {
                    const isMe = msg.sender === "me";
                    const isVoiceMsg =
                      msg.mediaType === "audio" ||
                      Boolean(
                        msg.mediaUrl &&
                          (msg.mediaUrl.startsWith("data:audio") ||
                            msg.mediaUrl.includes("audio") ||
                            msg.mediaUrl.includes(".webm") ||
                            msg.mediaUrl.includes(".ogg") ||
                            msg.mediaUrl.includes(".mp3") ||
                            msg.mediaUrl.includes(".wav") ||
                            msg.text?.includes("Voice"))
                      );

                    const isImageMsg =
                      msg.mediaType === "image" ||
                      msg.type === "image" ||
                      Boolean(
                        msg.mediaUrl &&
                          (msg.mediaUrl.startsWith("data:image") ||
                            /\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?.*)?$/i.test(msg.mediaUrl) ||
                            msg.mediaUrl.includes("/uploads/") ||
                            msg.mediaUrl.includes("cloudinary.com") ||
                            msg.mediaUrl.includes("blob:"))
                      ) ||
                      Boolean(msg.image || msg.imageUrl || msg.photo);

                    const rawImg = msg.mediaUrl || msg.image || msg.imageUrl || msg.photo || "";
                    const imgSource = isImageMsg && rawImg ? resolveImageUrl(rawImg) : null;

                    return (
                      <div
                        key={`${msg.id || "msg"}-${idx}`}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                      >
                        <div
                          className={cn(
                            "relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-3xl text-sm poppins-regular shadow-xs",
                            isMe
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-tr-xs shadow-rose-500/10"
                              : "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-700/60 rounded-tl-xs"
                          )}
                        >
                          {isVoiceMsg ? (
                            <VoiceMessagePlayer
                              audioUrl={resolveImageUrl(msg.mediaUrl)}
                              duration={msg.duration}
                              isMe={isMe}
                            />
                          ) : isImageMsg && imgSource ? (
                            <div className="space-y-1.5">
                              <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-xs">
                                <img
                                  src={imgSource}
                                  alt="Shared media"
                                  className="w-full h-auto max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                  onClick={() => window.open(imgSource, '_blank')}
                                />
                              </div>
                              {msg.text && (
                                <p className="leading-relaxed break-words pr-12 text-[13.5px]">{msg.text}</p>
                              )}
                            </div>
                          ) : (
                            <p className="leading-relaxed break-words pr-12 text-[13.5px]">{msg.text}</p>
                          )}
                          <div className="absolute bottom-1.5 right-3 flex items-center">
                            <span
                              className={cn(
                                "text-[10px] font-light select-none",
                                isMe ? "text-white/80" : "text-zinc-400"
                              )}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Bubble */}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-150">
                      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="flex-shrink-0 px-4 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm z-10">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendMessage(inputText + emoji)}
                    className="p-1.5 text-lg hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Message Input Bar */}
            <div className="flex-shrink-0 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shadow-md z-10">
              {isRecordingAudio ? (
                <VoiceMessageRecorder
                  isRecording={isRecordingAudio}
                  onCancel={() => setIsRecordingAudio(false)}
                  onSend={(voiceData) => {
                    setIsRecordingAudio(false);
                    handleSendVoiceNote(voiceData);
                  }}
                />
              ) : (
                <>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Emojis"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2 flex items-center border border-zinc-200/50 dark:border-zinc-700/50 focus-within:border-rose-500 dark:focus-within:border-rose-500 transition-colors">
                    <input
                      type="search"
                      role="searchbox"
                      name="search_chat_query"
                      id="search_chat_query"
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      inputMode="text"
                      aria-autocomplete="none"
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full bg-transparent text-sm poppins-regular text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                    />
                  </div>

                  {inputText.trim() ? (
                    <button
                      onClick={() => handleSendMessage()}
                      className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transition-all shadow-md shadow-rose-500/25 active:scale-95 cursor-pointer"
                      title="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRecordingAudio(true)}
                      className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all active:scale-95 cursor-pointer animate-pulse"
                      title="Record Voice Note"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Empty state when no match is selected or 0 matches exist */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg poppins-bold text-zinc-700 dark:text-zinc-200">
                {matches.length === 0 ? "No Matches Yet" : "Select a match to start chatting"}
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-zinc-500">
                {matches.length === 0
                  ? "Explore nearby singles on the Discover page and swipe right to get your first match!"
                  : "Choose someone from your matches on the left to view messages and make HD video or audio calls."}
              </p>
            </div>
            {matches.length === 0 && (
              <button
                onClick={() => router.push("/user")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs poppins-bold shadow-lg shadow-rose-600/30 hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              >
                <span>Discover Singles</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={handleAcceptIncomingCall}
          onReject={handleRejectIncomingCall}
        />
      )}

      {/* Live Agora Video / Audio Call Screen */}
      {activeCall && activeMatch && (
        <CallModel
          match={activeMatch}
          callType={activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}

      {/* Real User Profile Modal */}
      {showPartnerProfileModal && activeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setShowPartnerProfileModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header Cover Photo with Multiple Photos & Bullets Carousel */}
            {(() => {
              const currentPhotos = (
                Array.isArray(activeMatch.photos) && activeMatch.photos.length > 0
                  ? activeMatch.photos
                  : [activeMatch.userAvatar || activeMatch.photo]
              )
                .map((p) => resolveImageUrl(typeof p === "string" ? p : p?.url || p?.secure_url || p))
                .filter(Boolean);

              const totalPhotos = currentPhotos.length;
              const safeIndex = Math.min(
                Math.max(0, partnerModalPhotoIndex),
                Math.max(0, totalPhotos - 1)
              );
              const activePhotoUrl =
                currentPhotos[safeIndex] ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

              return (
                <div
                  className="relative w-full h-80 sm:h-96 bg-zinc-950 flex-shrink-0 overflow-hidden select-none group/photo"
                  onTouchStart={handlePhotoTouchStart}
                  onTouchEnd={(e) => handlePhotoTouchEnd(e, totalPhotos)}
                >
                  {/* Photo Image */}
                  <img
                    key={activePhotoUrl}
                    src={activePhotoUrl}
                    alt={`${activeMatch.userName} photo ${safeIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Story-style Progress Bars (when > 1 photo) */}
                  {totalPhotos > 1 && (
                    <div className="absolute top-2.5 left-3 right-3 z-30 flex items-center gap-1.5">
                      {currentPhotos.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPartnerModalPhotoIndex(idx);
                          }}
                          className="h-1 flex-1 rounded-full overflow-hidden bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:h-1.5"
                          title={`Photo ${idx + 1}`}
                        >
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              idx === safeIndex
                                ? "bg-white shadow"
                                : idx < safeIndex
                                ? "bg-white/70"
                                : "bg-white/25"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setShowPartnerProfileModal(false)}
                    className="absolute top-5 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer shadow-lg"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Match Badge & Photo Counter */}
                  <div className="absolute top-5 left-4 z-30 flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] poppins-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mutual Match</span>
                    </div>

                    {totalPhotos > 1 && (
                      <div className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] poppins-semibold backdrop-blur-md border border-white/10 shadow-sm">
                        {safeIndex + 1} / {totalPhotos}
                      </div>
                    )}
                  </div>

                  {/* Left & Right Tap Zones & Chevrons for navigation */}
                  {totalPhotos > 1 && (
                    <>
                      {/* Left click zone (previous photo) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnerModalPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
                        }}
                        className="absolute left-0 top-12 bottom-20 w-1/3 z-20 cursor-pointer"
                        title="Previous Photo"
                      />

                      {/* Right click zone (next photo) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnerModalPhotoIndex((prev) => (prev + 1) % totalPhotos);
                        }}
                        className="absolute right-0 top-12 bottom-20 w-1/3 z-20 cursor-pointer"
                        title="Next Photo"
                      />

                      {/* Left Arrow Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnerModalPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md transition-all opacity-80 group-hover/photo:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-xl border border-white/10"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Right Arrow Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnerModalPhotoIndex((prev) => (prev + 1) % totalPhotos);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md transition-all opacity-80 group-hover/photo:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-xl border border-white/10"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Bottom Pagination Bullet Dots */}
                  {totalPhotos > 1 && (
                    <div className="absolute bottom-16 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                        {currentPhotos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPartnerModalPhotoIndex(idx);
                            }}
                            className={cn(
                              "transition-all duration-300 rounded-full cursor-pointer",
                              idx === safeIndex
                                ? "w-5 h-2 bg-gradient-to-r from-rose-500 to-pink-500 shadow-md shadow-rose-500/50"
                                : "w-2 h-2 bg-white/50 hover:bg-white/90"
                            )}
                            aria-label={`Go to photo ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Info on Photo */}
                  <div className="absolute bottom-3 left-4 right-4 z-20 text-white pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl poppins-bold truncate drop-shadow-md">
                        {activeMatch.userName}, {activeMatch.age || 24}
                      </h2>
                      <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 drop-shadow" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-300 drop-shadow-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {activeMatch.city || "Nearby"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isPartnerOnline(activeMatch)
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-zinc-400"
                          )}
                        />
                        {isPartnerOnline(activeMatch) ? "Online now" : "Recently active"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Profile Details Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Bio */}
              <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  About
                </h4>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs">
                  {activeMatch.bio || "Hey! Nice to connect with you on Prem Jodo ✨ Looking forward to having great conversations!"}
                </p>
              </div>

              {/* Relationship Goals */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Looking For
                </h4>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-semibold text-xs">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{activeMatch.lookingFor || "Long-term Relationship"}</span>
                </div>
              </div>

              {/* Profession & Education */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-rose-500" /> Profession
                  </div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {activeMatch.occupation || "Working Professional"}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-500" /> Education
                  </div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {activeMatch.education || "University Graduate"}
                  </p>
                </div>
              </div>

              {/* Interests & Passions */}
              {activeMatch.interests && activeMatch.interests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Interests & Passions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] border border-zinc-200 dark:border-zinc-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowPartnerProfileModal(false);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
                <button
                  onClick={() => {
                    setShowPartnerProfileModal(false);
                    setActiveCall("video");
                  }}
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-800 dark:text-zinc-200 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => {
                    setShowPartnerProfileModal(false);
                    setActiveCall("audio");
                  }}
                  className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-800 dark:text-zinc-200 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Audio Call"
                >
                  <Phone className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserMatchesPage() {
  return (
    <Suspense fallback={<MatchesSkeletonLoader />}>
      <MatchesAndChatContent />
    </Suspense>
  );
}
