"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Coffee,
  Music,
  Trash2,
  UserX,
} from "lucide-react";
import { CallModel } from "./CallModel";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import VoiceMessageRecorder from "./VoiceMessageRecorder";
import { cn, formatLastActive } from "@/lib/common/utils";
import chatService from "@/lib/services/chat.service";
import matchService from "@/lib/services/match.service";
import socketService from "@/lib/services/socket.service";
import { useAuth } from "@/context/AuthContext";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

export function ChatModel({ match, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const rawMsgs = match?.messages;
    if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
      const currentUserId = user?._id || user?.id;
      return rawMsgs.map((m) => {
        const senderId = m.sender?._id || m.sender || m.senderId;
        const isMe = String(senderId) === String(currentUserId);
        return {
          id: m._id || m.id || Date.now().toString(),
          sender: isMe ? "me" : "them",
          text: m.content || m.text || m.message || "",
          mediaUrl: m.mediaUrl || null,
          mediaType: m.mediaType || (m.mediaUrl ? "audio" : null),
          duration: m.duration || null,
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
          status: m.isRead ? "read" : "sent",
        };
      });
    }
    return [];
  });
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // null, "video", "audio"
  const [isLoadingMessages, setIsLoadingMessages] = useState(() => {
    if (Array.isArray(match?.messages) && match.messages.length > 0) return false;
    const convId = match?.conversationId || match?._id || match?.id;
    return Boolean(convId && String(convId).length >= 10 && !String(convId).startsWith("usr_"));
  });
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenTimestamps, setLastSeenTimestamps] = useState(new Map());
  const [, setTicker] = useState(0);

  const messagesEndRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Dynamic status updater ticker - re-renders every 10s to dynamically tick ("just now" -> "1m ago" -> "2m ago")
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = socketService.onOnlineUsersChange((usersList, usersSet, lastSeen) => {
      setOnlineUsers(new Set(usersSet));
      if (lastSeen) {
        setLastSeenTimestamps(new Map(lastSeen));
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Listen for real-time incoming messages, typing & read receipts in ChatModel
  useEffect(() => {
    const convId = match?.conversationId || match?._id || match?.id;
    const cleanConvId = convId ? String(convId).replace(/^conv_/, "") : "";
    const partnerId = match?.partnerUserId || match?.partner?._id || match?.userId;
    const currentUserId = user?._id || user?.id;

    if (cleanConvId) {
      socketService.joinChat(cleanConvId);
      socketService.emitMarkRead({
        conversationId: cleanConvId,
        readerId: currentUserId,
        senderId: partnerId,
      });
    }

    const unsubMsg = socketService.onMessageReceived((newMsg) => {
      if (!newMsg) return;
      const msgConvId = String(newMsg.conversationId || newMsg.conversation?._id || newMsg.conversation || "").replace(/^conv_/, "");
      const senderId = String(newMsg.sender?._id || newMsg.sender?.id || newMsg.sender || newMsg.senderId || "");

      const isForThisChat =
        (cleanConvId && msgConvId && cleanConvId === msgConvId) ||
        (partnerId && senderId && String(partnerId) === senderId);

      if (isForThisChat) {
        const isMe = currentUserId && String(senderId) === String(currentUserId);
        const item = {
          id: newMsg._id || newMsg.id || `sock_${Date.now()}`,
          sender: isMe ? "me" : "them",
          text: newMsg.content || newMsg.text || newMsg.message || "",
          mediaUrl: newMsg.mediaUrl || null,
          mediaType: newMsg.mediaType || (newMsg.mediaUrl ? "audio" : null),
          duration: newMsg.duration || null,
          time: newMsg.createdAt ? new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
          status: isMe ? (newMsg.status === "read" || newMsg.isRead ? "read" : (newMsg.status || "delivered")) : (newMsg.status || "delivered"),
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === item.id)) return prev;
          return [...prev, item];
        });
      }
    });

    const unsubTyping = socketService.onTyping((data) => {
      if (!data) return;
      const dataConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const senderId = String(data.senderId || data.userId || data.from || "").trim();

      const isForThis =
        (cleanConvId && dataConv && cleanConvId === dataConv) ||
        (partnerId && senderId && String(partnerId) === senderId);

      if (isForThis) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3500);
      }
    });

    const unsubStopTyping = socketService.onStopTyping((data) => {
      if (!data) return;
      const dataConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const senderId = String(data.senderId || data.userId || data.from || "").trim();

      const isForThis =
        (cleanConvId && dataConv && cleanConvId === dataConv) ||
        (partnerId && senderId && String(partnerId) === senderId);

      if (isForThis) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
      }
    });

    const unsubRead = socketService.onReadReceipt((data) => {
      if (!data) return;
      const readConv = String(data.conversationId || data.chatId || "").replace(/^conv_/, "");
      const readerId = String(data.readerId || data.userId || "").trim();
      const myId = String(user?._id || user?.id || "").trim();

      // Ignore my own mark_read events
      if (readerId && myId && readerId === myId) return;

      const isForThis =
        (cleanConvId && readConv && cleanConvId === readConv) ||
        (partnerId && readerId && String(partnerId) === readerId);

      if (isForThis) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === "me" ? { ...m, status: "read", isRead: true } : m))
        );
      }
    });

    return () => {
      if (unsubMsg) unsubMsg();
      if (unsubTyping) unsubTyping();
      if (unsubStopTyping) unsubStopTyping();
      if (unsubRead) unsubRead();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (cleanConvId) socketService.leaveChat(cleanConvId);
    };
  }, [match, user]);

  const partnerId = String(match?.partnerUserId || match?.partner?._id || match?.userId || "").trim();
  const isOnline = Boolean(partnerId && !partnerId.startsWith("conv_") && !partnerId.startsWith("usr_") && partnerId.length >= 10 && onlineUsers.has(partnerId));

  const getPartnerStatusText = () => {
    if (isOnline) return "Active now";
    const realTimeLastSeen = partnerId ? lastSeenTimestamps.get(partnerId) || socketService.getUserLastSeen(partnerId) : null;
    const lastSeenDate = realTimeLastSeen || match?.lastActiveAt;
    return formatLastActive(lastSeenDate);
  };

  // Load conversation messages from backend if conversationId exists
  useEffect(() => {
    const convId = match?.conversationId || match?._id || match?.id;
    if (convId && convId.length >= 12 && !convId.startsWith("usr_")) {
      async function loadRemoteMsgs() {
        if (!match?.messages || match.messages.length === 0) {
          setIsLoadingMessages(true);
        }
        try {
          const msgs = (Array.isArray(match?.messages) && match.messages.length > 0)
            ? match.messages
            : await chatService.getMessages(convId);
          if (Array.isArray(msgs) && msgs.length > 0) {
            const currentUserId = user?._id || user?.id;
            const formatted = msgs.map((m) => {
              const senderId = m.sender?._id || m.sender || m.senderId;
              const isMe = String(senderId) === String(currentUserId);
              return {
                id: m._id || Date.now().toString(),
                sender: isMe ? "me" : "them",
                text: m.content || m.text || m.message || "",
                mediaUrl: m.mediaUrl || null,
                mediaType: m.mediaType || (m.mediaUrl ? "audio" : null),
                duration: m.duration || null,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
                status: m.isRead ? "read" : "sent",
              };
            });
            setMessages(formatted);
          }
        } catch {} finally {
          setIsLoadingMessages(false);
        }
      }
      loadRemoteMsgs();
    }
  }, [match, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const convId = match?.conversationId || match?._id || match?.id;
    const cleanConvId = convId ? String(convId).replace(/^conv_/, "") : "";
    const partnerId = match?.partnerUserId || match?.partner?._id || match?.userId;
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
    if (!trimmed) return;

    const convId = match?.conversationId || match?._id || match?.id;
    const cleanConvId = convId ? String(convId).replace(/^conv_/, "") : "";
    const partnerId = match?.partnerUserId || match?.partner?._id || match?.userId;
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

    setMessages((prev) => [...prev, newMessage]);
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
    if (!audioUrl) return;

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

    setMessages((prev) => [...prev, newMessage]);

    const convId = match?.conversationId || match?._id || match?.id;
    const cleanConvId = convId ? String(convId).replace(/^conv_/, "") : "";
    const partnerId = match?.partnerUserId || match?.partner?._id || match?.userId;
    const currentUserId = user?._id || user?.id;

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

  const handleClearMessages = async () => {
    setMessages([]);
    setShowMenu(false);
    const convId = match?.conversationId || match?._id || match?.id;
    if (convId) {
      await chatService.clearMessages(convId);
    }
  };

  const handleUnmatch = async () => {
    setShowMenu(false);
    onClose();
    const matchId = match?.partnerUserId || match?.id || match?._id;
    if (matchId) {
      await matchService.unmatchUser(matchId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickEmojis = ["❤️", "😍", "😊", "☕", "🥂", "🔥", "🌸", "✨", "🎉", "👌"];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="relative w-full sm:max-w-2xl h-full sm:h-[680px] sm:max-h-[92vh] bg-white dark:bg-zinc-900 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 transition-colors">
          
          {/* Header - Prem Jodo Theme */}
          <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-900 dark:text-zinc-100 z-20 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <button
                onClick={onClose}
                className="p-2 -ml-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar + Active Status Dot */}
              <div className="relative flex-shrink-0 cursor-pointer">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400">
                  <img
                    src={resolveImageUrl(
                      match?.userAvatar,
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    )}
                    alt={match?.userName || "Match"}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                  />
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-zinc-900 rounded-full",
                    isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                  )}
                />
              </div>

              {/* Contact Info */}
              <div className="min-w-0">
                <h3 className="poppins-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                  {match?.userName}
                  <span className="text-[10px] poppins-semibold px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    Match
                  </span>
                </h3>
                <p
                  className={cn(
                    "text-xs poppins-medium flex items-center gap-1.5",
                    isOnline
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {isTyping ? (
                    <span className="text-rose-500 animate-pulse font-semibold">typing...</span>
                  ) : isOnline ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active now</span>
                    </>
                  ) : (
                    <span>{getPartnerStatusText()}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons: Video Call, Audio Call, More, Close */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl py-1.5 z-50 border border-zinc-200 dark:border-zinc-700 text-xs poppins-medium text-zinc-700 dark:text-zinc-200">
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
                      onClick={handleClearMessages}
                      className="w-full px-4 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-zinc-500" /> Clear Messages
                    </button>
                    <button
                      onClick={handleUnmatch}
                      className="w-full px-4 py-2.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer border-t border-zinc-100 dark:border-zinc-700/60 font-semibold"
                    >
                      <UserX className="w-4 h-4" /> Unmatch & Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="hidden sm:flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 relative bg-zinc-50/80 dark:bg-zinc-950">
            {!isLoadingMessages && messages.length > 0 && (
              <>
                {/* Encryption notice */}
                <div className="flex justify-center my-1.5">
                  <div className="flex items-center gap-1.5 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs poppins-medium px-3.5 py-1.5 rounded-full max-w-sm text-center shadow-xs">
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
                {messages.map((msg, idx) => {
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
                          "relative max-w-[84%] sm:max-w-[72%] px-4 py-2.5 rounded-3xl shadow-xs text-sm poppins-regular",
                          isMe
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-tr-xs shadow-rose-500/10"
                            : "bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-700/60 rounded-tl-xs shadow-xs"
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
              </>
            )}

            {/* Typing Indicator */}
            {!isLoadingMessages && isTyping && (
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

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
          <div className="px-3.5 sm:px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center gap-2 z-20 border-t border-zinc-200 dark:border-zinc-800">
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

                {/* Input Box */}
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl px-4 py-2 flex items-center border border-zinc-200/50 dark:border-zinc-700/50 focus-within:border-rose-500 dark:focus-within:border-rose-500 transition-colors">
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

                {/* Send or Voice Note Button */}
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
        </div>
      </div>

      {/* Audio / Video Call Screen */}
      {activeCall && (
        <CallModel
          match={match}
          callType={activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}
    </>
  );
}

// Aliases
export const chatModel = ChatModel;
export default ChatModel;
