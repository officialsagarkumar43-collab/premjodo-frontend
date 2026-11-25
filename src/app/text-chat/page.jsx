"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import {
  MessageCircle,
  Send,
  User,
  RefreshCw,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Circle,
  Radio,
} from "lucide-react";

export default function GuestRandomTextChatPage() {
  const [nickname, setNickname] = useState("");
  const [chatStatus, setChatStatus] = useState("idle"); // "idle" | "searching" | "connected" | "partner_left"
  const [statusMessage, setStatusMessage] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [stats, setStats] = useState({ onlineGuests: 0, inQueue: 0, activeChats: 0 });
  const [isConnectedToServer, setIsConnectedToServer] = useState(false);

  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const partnerTypingTimerRef = useRef(null);
  const myGuestIdRef = useRef(null);

  const socketBaseUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  // Fetch live stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiBase}/guest-chat/stats`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setStats(json.data);
          }
        }
      } catch (err) {
        // Backend might be offline or stats not available yet
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize socket on mount or when needed
  const getSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect to /guest-chat namespace
    const socket = io(`${socketBaseUrl}/guest-chat`, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      setIsConnectedToServer(true);
      myGuestIdRef.current = socket.id;
    });

    socket.on("disconnect", () => {
      setIsConnectedToServer(false);
    });

    socket.on("connect_error", () => {
      setIsConnectedToServer(false);
    });

    // Event: Waiting in queue
    socket.on("waiting_for_partner", (data) => {
      setChatStatus("searching");
      setStatusMessage(
        data?.message || "Looking for someone to chat with... Please wait."
      );
    });

    // Event: Partner found
    socket.on("partner_found", (data) => {
      setChatStatus("connected");
      setRoomId(data?.roomId || null);
      setPartner(data?.partner || { nickname: "Stranger" });
      setMessages([]);
      setIsPartnerTyping(false);
    });

    // Event: New message
    socket.on("new_message", (data) => {
      setIsPartnerTyping(false);
      if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
      const msg = data?.message || data;
      if (msg) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Event: Partner typing handlers
    const handlePartnerTyping = () => {
      setIsPartnerTyping(true);
      if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
      partnerTypingTimerRef.current = setTimeout(() => {
        setIsPartnerTyping(false);
      }, 3500);
    };

    const handlePartnerStopTyping = () => {
      setIsPartnerTyping(false);
      if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
    };

    socket.on("partner_typing", handlePartnerTyping);
    socket.on("typing", handlePartnerTyping);
    socket.on("user_typing", handlePartnerTyping);
    socket.on("partner_stop_typing", handlePartnerStopTyping);
    socket.on("stop_typing", handlePartnerStopTyping);
    socket.on("user_stop_typing", handlePartnerStopTyping);

    // Event: Partner left or skipped
    socket.on("partner_left", (data) => {
      setChatStatus("partner_left");
      setStatusMessage(
        data?.message ||
        "Partner has skipped or left the chat. Click Next to connect with someone new."
      );
      setIsPartnerTyping(false);
    });

    socketRef.current = socket;
    return socket;
  }, [socketBaseUrl]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("end_chat");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto scroll messages to bottom inside container ONLY (does NOT scroll the window)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isPartnerTyping]);

  // Handle Find Partner
  const handleFindPartner = (customName) => {
    const socket = getSocket();
    const finalName = customName || nickname.trim() || undefined;
    setChatStatus("searching");
    setStatusMessage("Looking for someone to chat with... Please wait.");
    socket.emit("find_partner", { nickname: finalName });
  };

  // Handle Cancel Search
  const handleCancelSearch = () => {
    if (socketRef.current) {
      socketRef.current.emit("cancel_search");
    }
    setChatStatus("idle");
    setStatusMessage("");
  };

  // Handle Next Partner
  const handleNextPartner = () => {
    if (socketRef.current) {
      setChatStatus("searching");
      setStatusMessage("Searching for a new partner...");
      setMessages([]);
      setPartner(null);
      setIsPartnerTyping(false);
      socketRef.current.emit("next_partner");
    } else {
      handleFindPartner();
    }
  };

  // Handle End Chat
  const handleEndChat = () => {
    if (socketRef.current) {
      socketRef.current.emit("end_chat");
    }
    setChatStatus("idle");
    setPartner(null);
    setRoomId(null);
    setMessages([]);
    setIsPartnerTyping(false);
  };

  // Handle Send Message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || chatStatus !== "connected") return;

    const content = inputText.trim();
    setInputText("");

    if (socketRef.current) {
      socketRef.current.emit("stop_typing");
      if (roomId) socketRef.current.emit("stop_typing", { roomId });
      socketRef.current.emit("send_message", { content });
    }
  };

  // Handle Typing
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socketRef.current && chatStatus === "connected") {
      socketRef.current.emit("typing");
      if (roomId) socketRef.current.emit("typing", { roomId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stop_typing");
          if (roomId) socketRef.current.emit("stop_typing", { roomId });
        }
      }, 1500);
    }
  };

  // Global Keyboard Shortcuts (Esc to Next/Skip)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (chatStatus === "connected" || chatStatus === "partner_left") {
          handleNextPartner();
        } else if (chatStatus === "searching") {
          handleCancelSearch();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatStatus]);

  return (
    <div className="min-h-screen h-[100dvh] flex flex-col bg-zinc-100 dark:bg-[#1a1318] text-zinc-900 dark:text-zinc-100 selection:bg-rose-500/20 overflow-hidden sm:overflow-auto">
      {/* Top Standalone Header Bar (No Navbar) */}
      <header className="shrink-0 w-full border-b border-zinc-200/80 dark:border-[#2f1927] bg-white/95 dark:bg-[#140d12]/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 z-20">
        <div className="max-w-[760px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Icon Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-[#20141d] dark:hover:bg-[#2b1b27] border border-zinc-200 dark:border-[#351d2c] text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-xs font-semibold shadow-xs"
              title="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>

            {/* Brand Logo */}
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[760px] mx-auto p-0 sm:px-4 sm:py-5 flex flex-col justify-center min-h-0">

        {/* =========================================================================
            STATE 1: IDLE / WELCOME SCREEN
           ========================================================================= */}
        {chatStatus === "idle" && (
          <div className="w-full flex-1 h-full sm:h-[580px] sm:max-h-[78vh] sm:shrink-0 flex flex-col items-center justify-center py-8 px-4 text-center mt-0 sm:mt-3 bg-white dark:bg-[#0a0508] rounded-none sm:rounded-3xl border-0 sm:border border-zinc-200 dark:border-[#381e30] shadow-none sm:shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              Meet Someone New.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm leading-relaxed">
              Connect with a random stranger right now. Chat 100% anonymously, share thoughts, or just say hello. No account or names required.
            </p>

            {/* Start Button */}
            <button
              type="button"
              onClick={() => handleFindPartner()}
              className="w-full max-w-sm py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start Random Chat</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Quick Safety Note */}
            <p className="mt-6 text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal max-w-xs">
              🔒 Completely anonymous & private 1v1 rooms. Please be kind and respectful.
            </p>
          </div>
        )}

        {/* =========================================================================
            STATE 2: SEARCHING / RADAR SCREEN
           ========================================================================= */}
        {chatStatus === "searching" && (
          <div className="w-full flex-1 h-full sm:h-[580px] sm:max-h-[78vh] sm:shrink-0 flex flex-col items-center justify-center py-8 px-4 text-center mt-0 sm:mt-3 bg-white dark:bg-[#0a0508] rounded-none sm:rounded-3xl border-0 sm:border border-zinc-200 dark:border-[#381e30] shadow-none sm:shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
            {/* Animated Radar Pulse */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-6">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-rose-500/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
                <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-2">
              Looking for a partner...
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
              {statusMessage || "Pairing you with an available stranger..."}
            </p>

            <button
              type="button"
              onClick={handleCancelSearch}
              className="px-5 py-2 rounded-full border border-zinc-300 dark:border-[#381e30] hover:bg-zinc-100 dark:hover:bg-[#1a0f16] text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel Search
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONNECTED OR PARTNER LEFT (ACTIVE CHAT ROOM)
           ========================================================================= */}
        {(chatStatus === "connected" || chatStatus === "partner_left") && (
          <div className="w-full flex-1 h-full sm:h-[580px] sm:max-h-[78vh] sm:shrink-0 flex flex-col mt-0 sm:mt-3 bg-white dark:bg-[#0a0508] rounded-none sm:rounded-3xl border-0 sm:border border-zinc-200 dark:border-[#381e30] shadow-none sm:shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Chat Room Top Bar */}
            <div className="shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-zinc-50 dark:bg-[#12090e] border-b border-zinc-200 dark:border-[#381e30] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      Anonymous
                    </span>
                    {chatStatus === "connected" ? (
                      isPartnerTyping ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 dark:text-rose-400 animate-pulse">
                          <Circle className="w-2 h-2 fill-rose-500 text-rose-500 animate-ping" />
                          typing...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                          Connected
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500">
                        <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />
                        Disconnected
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Press <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px]">Esc</kbd> to skip partner
                  </div>
                </div>
              </div>

              {/* Room Controls: Next & Stop */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNextPartner}
                  className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Skip to next partner (Esc)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Next Partner</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndChat}
                  className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-[#251821] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer"
                  title="Leave chat"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area - FIXED HEIGHT, OVERFLOW Y AUTO, DOES NOT MOVE PAGE */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-3 overscroll-contain bg-white dark:bg-[#0a0508]"
            >
              {/* Welcome Notice Banner */}
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center text-xs text-rose-700 dark:text-rose-300">
                🎉 Connected with an anonymous stranger! Say hello 👋
              </div>

              {messages.map((m, idx) => {
                const isMe =
                  m.senderGuestId === myGuestIdRef.current ||
                  m.senderNickname === nickname ||
                  m.senderNickname === "You";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                        ? "bg-rose-600 text-white rounded-br-xs shadow-xs"
                        : "bg-zinc-100 dark:bg-[#1a0f16] text-zinc-900 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/50 dark:border-[#351c2c]"
                        }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}

              {/* Live Partner Typing Indicator inside Chat Stream */}
              {isPartnerTyping && (
                <div className="flex flex-col items-start gap-1 py-1">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-xs bg-zinc-100 dark:bg-[#1a0f16] border border-zinc-200/50 dark:border-[#351c2c] inline-flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[10px] text-zinc-400 px-1">Anonymous is typing...</span>
                </div>
              )}

              {/* Partner Left Notice */}
              {chatStatus === "partner_left" && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-center space-y-3 my-4">
                  <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {statusMessage || "Partner has disconnected or skipped to next chat."}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextPartner}
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Find Next Partner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input Bar - FIXED AT BOTTOM */}
            <form
              onSubmit={handleSendMessage}
              className="shrink-0 p-2.5 sm:p-3.5 bg-zinc-50 dark:bg-[#12090e] border-t border-zinc-200 dark:border-[#381e30] flex items-center gap-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:pb-3.5"
            >
              <input
                type="text"
                disabled={chatStatus !== "connected"}
                value={inputText}
                onChange={handleInputChange}
                placeholder={
                  chatStatus === "connected"
                    ? "Type a message... (Press Enter to send)"
                    : "Chat disconnected. Click 'Next Partner' above."
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a0f16] border border-zinc-200 dark:border-[#381e30] text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || chatStatus !== "connected"}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xs disabled:opacity-40 disabled:hover:bg-rose-600 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
