"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatConversationDateTime, cn } from "@/lib/common/utils";
import { Sparkles, MessageCircle, ChevronRight } from "lucide-react";
import socketService from "@/lib/services/socket.service";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

export function MatchesList({ matches = [], onSelectMatch }) {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const unsub = socketService.onOnlineUsersChange((usersList, usersSet) => {
      setOnlineUsers(new Set(usersSet));
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const isPartnerOnline = (match) => {
    if (!match) return false;
    const pId = String(match.partnerUserId || match.partner?._id || match.userId || "").trim();
    if (!pId || pId.startsWith("conv_") || pId.startsWith("usr_") || pId.length < 10) return false;
    return Boolean(onlineUsers.has(pId));
  };

  const handleMatchClick = (match) => {
    if (onSelectMatch) {
      onSelectMatch(match);
    } else {
      router.push(`/user/matches?id=${match.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col flex-1 min-h-0 max-h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="poppins-bold text-base lg:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          Recent Matches
        </h3>
        <span className="text-xs poppins-semibold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
          {matches.length} {matches.length === 1 ? "Match" : "Matches"}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="py-6 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5" />
          </div>
          <p className="text-sm poppins-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">
            No matches yet
          </p>
          <p className="text-xs poppins-regular text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Swipe right on profiles you like to get your first match!
          </p>
        </div>
      ) : (
        <>
          {/* Horizontal Story avatars */}
          <div
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-3.5 overflow-x-auto py-1 px-0.5 no-scrollbar border-b border-zinc-100 dark:border-zinc-800 mb-3 flex-shrink-0 scroll-smooth overscroll-x-contain touch-pan-x"
          >
            {matches.map((match) => {
              const isOnline = isPartnerOnline(match);
              return (
                <button
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group focus:outline-none p-0.5"
                  title={`Open chat with ${match.userName} (${isOnline ? "Online" : "Offline"})`}
                >
                  <div
                    className={cn(
                      "relative p-[2px] rounded-full group-hover:scale-105 transition-transform duration-200",
                      isOnline
                        ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400"
                        : "bg-zinc-200 dark:bg-zinc-700/60"
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
                        "absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-zinc-900 rounded-full",
                        isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                      )}
                    />
                  </div>
                  <span className="text-[11px] poppins-medium mt-1 text-zinc-700 dark:text-zinc-300 max-w-[56px] truncate">
                    {match.userName.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Message Previews */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
              <h4 className="text-xs sm:text-sm poppins-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Messages
              </h4>
              <span className="text-xs sm:text-sm text-emerald-500 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> Direct Chats
              </span>
            </div>

            <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1.5 scroll-smooth">
              {matches.map((match) => {
                const isOnline = isPartnerOnline(match);
                return (
                  <div
                    key={match.id}
                    onClick={() => handleMatchClick(match)}
                    className="flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={resolveImageUrl(
                          match.userAvatar,
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                        )}
                        alt={match.userName}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-zinc-900 rounded-full",
                          isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="poppins-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-500 transition-colors">
                          {match.userName}
                        </h5>
                        {(() => {
                          const { date, time } = formatConversationDateTime(match.lastMessageTime || match.matchedAt);
                          return (
                            <div className="flex flex-col items-end flex-shrink-0 ml-2 leading-tight text-right">
                              <span className="text-xs poppins-semibold text-zinc-600 dark:text-zinc-400">
                                {date}
                              </span>
                              {time && (
                                <span className="text-[10px] poppins-regular text-zinc-400 dark:text-zinc-500 mt-0.5">
                                  {time}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs sm:text-[13px] poppins-normal text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {match.lastMessage || "You matched! Tap to chat."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400 group-hover:text-rose-500 transition-colors flex-shrink-0">
                      {match.unreadCount ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

