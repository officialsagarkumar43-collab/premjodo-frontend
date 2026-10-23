/**
 * Real-time Socket.io Client for Prem Jodo
 * Connects to backend WebSocket server 
 */

import { io } from "socket.io-client";
import { getAccessToken } from "./apiClient";
import { parseJwtPayload } from "./auth.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

let socket = null;
let battleSocket = null;
let currentRegisteredUserId = null;
let onlineUsers = new Set();
let lastSeenMap = new Map();

export const registerBattleUserOnSocket = (sock, id) => {
  if (!sock || !id) return;
  const strId = String(id).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
  if (!strId) return;
  sock.emit("battle:setup", strId);
  sock.emit("setup", strId);
  sock.emit("battle:register", strId);
  sock.emit("register", strId);
  sock.emit("battle:join_user", strId);
  sock.emit("join_user", strId);
  sock.emit("identity", strId);
  sock.emit("join", strId);
  sock.emit("join", `user_${strId}`);
  sock.emit("join", `battle_user_${strId}`);
};

export const getBattleSocket = () => {
  if (typeof window === "undefined") return null;
  if (battleSocket && battleSocket.connected) return battleSocket;
  if (!battleSocket) {
    try {
      battleSocket = io(`${SOCKET_URL}/battle`, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 800,
      });
      battleSocket.on("connect", () => {
        const uid = currentRegisteredUserId || getStoredUserId();
        if (uid) {
          registerBattleUserOnSocket(battleSocket, uid);
        }
      });
      battleSocket.on("reconnect", () => {
        const uid = currentRegisteredUserId || getStoredUserId();
        if (uid) {
          registerBattleUserOnSocket(battleSocket, uid);
        }
      });
    } catch (e) {
      return getSocket();
    }
  }
  return battleSocket;
};

// Persistent listener sets
const onlineListeners = new Set();
const messageListeners = new Set();
const conversationListeners = new Set();
const matchListeners = new Set();
const newConversationListeners = new Set();
const typingListeners = new Set();
const stopTypingListeners = new Set();
const readReceiptListeners = new Set();
const incomingCallListeners = new Set();
const callAcceptedListeners = new Set();
const callEndedListeners = new Set();
const membershipListeners = new Set();

const notifyOnlineListeners = () => {
  const usersList = Array.from(onlineUsers);
  onlineListeners.forEach((cb) => {
    try {
      cb(usersList, onlineUsers, lastSeenMap);
    } catch (e) {
      console.warn("Online listener error:", e);
    }
  });
};

const getStoredUserId = () => {
  if (typeof window === "undefined") return null;
  try {
    const token = getAccessToken();
    if (token) {
      const payload = parseJwtPayload(token);
      const uid = payload?._id || payload?.id || payload?.userId;
      if (uid) return String(uid).trim();
    }
  } catch { }
  return null;
};

const registerUserOnSocket = (sock, id) => {
  if (!sock || !id) return;
  const strId = String(id).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
  if (!strId) return;

  currentRegisteredUserId = strId;

  sock.emit("setup", strId);
  sock.emit("setup", { id: strId, _id: strId, userId: strId });
  sock.emit("join_user", strId);
  sock.emit("join_user", { id: strId, _id: strId, userId: strId });
  sock.emit("join", strId);
  sock.emit("join", `user_${strId}`);
  sock.emit("user_connected", strId);
  sock.emit("identity", strId);
  sock.emit("register", strId);
  sock.emit("register", { userId: strId });
  sock.emit("addUser", strId);
  sock.emit("add_user", strId);
  sock.emit("register_user", strId);

  registerBattleUserOnSocket(sock, strId);
  if (battleSocket && battleSocket !== sock) {
    registerBattleUserOnSocket(battleSocket, strId);
  }
};

const initSocket = () => {
  if (typeof window === "undefined") return null;
  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 800,
    });

    socket.on("connect", () => {
      const uid = currentRegisteredUserId || getStoredUserId();
      if (uid) {
        registerUserOnSocket(socket, uid);
      }
    });

    socket.on("reconnect", () => {
      const uid = currentRegisteredUserId || getStoredUserId();
      if (uid) {
        registerUserOnSocket(socket, uid);
      }
    });

    // Track online / offline users
    socket.on("online_users", (users) => {
      if (Array.isArray(users)) {
        onlineUsers = new Set(users.map((u) => String(u).trim()));
        notifyOnlineListeners();
      }
    });

    socket.on("user_online", (data) => {
      const uid = String(data?.userId || data?.user?._id || data?.id || data || "").trim();
      if (uid) {
        onlineUsers.add(uid);
        lastSeenMap.delete(uid);
        notifyOnlineListeners();
      }
    });

    socket.on("user_offline", (data) => {
      const uid = String(data?.userId || data?.user?._id || data?.id || data || "").trim();
      if (uid) {
        onlineUsers.delete(uid);
        const offlineTime = data?.timestamp || data?.lastSeen || new Date().toISOString();
        lastSeenMap.set(uid, offlineTime);
        notifyOnlineListeners();
      }
    });

    // Message handler with strict multi-level deduplication
    const receivedIds = new Set();
    const recentContentHashes = new Map(); // hash -> timestamp

    const handleIncomingMessage = (rawMsg) => {
      if (!rawMsg) return;
      let msg = rawMsg;
      if (typeof rawMsg === "object" && rawMsg !== null) {
        if (rawMsg.data && typeof rawMsg.data === "object") {
          msg = { ...rawMsg.data, ...rawMsg };
        } else if (rawMsg.payload && typeof rawMsg.payload === "object") {
          msg = { ...rawMsg.payload, ...rawMsg };
        }
      }
      if (!msg) return;

      const rawText = String(
        (typeof msg === "string" ? msg : "") ||
        msg.content ||
        msg.text ||
        (typeof msg.message === "string" ? msg.message : "") ||
        msg.body ||
        ""
      ).trim();
      const rawSender = String(msg.sender?._id || msg.sender?.id || msg.sender || msg.senderId || msg.from || "").trim();
      const rawTime = String(msg.createdAt || msg.timestamp || "").trim();
      const msgId = String(
        msg._id ||
        msg.id ||
        msg.messageId ||
        ""
      ).trim();

      const now = Date.now();

      // Check ID deduplication
      if (msgId && receivedIds.has(msgId)) {
        return;
      }

      // Check content + sender deduplication within 2.5s window
      if (rawSender && rawText) {
        const contentKey = `${rawSender}_${rawText}`;
        const lastSeen = recentContentHashes.get(contentKey);
        if (lastSeen && now - lastSeen < 2500) {
          return;
        }
        recentContentHashes.set(contentKey, now);
        if (recentContentHashes.size > 200) {
          const firstKey = recentContentHashes.keys().next().value;
          recentContentHashes.delete(firstKey);
        }
      }

      if (msgId) {
        receivedIds.add(msgId);
        if (receivedIds.size > 500) {
          const first = receivedIds.values().next().value;
          receivedIds.delete(first);
        }
      }

      messageListeners.forEach((cb) => {
        try {
          cb(msg);
        } catch (err) { }
      });
    };

    const messageEvents = [
      "message_received",
      "messageReceived",
      "new_message",
      "newMessage",
      "receive_message",
      "receiveMessage",
      "message",
      "chat_message",
      "chatMessage",
      "direct_message",
      "incoming_message",
      "msg_receive",
      "chat:message",
      "message:new",
      "message:received",
    ];
    messageEvents.forEach((ev) => socket.on(ev, handleIncomingMessage));

    // Conversation update events
    const handleConversationUpdated = (data) => {
      if (!data) return;
      conversationListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    };
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("recent_chats_updated", handleConversationUpdated);

    // New Match events
    const handleNewMatch = (data) => {
      if (!data) return;
      matchListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    };
    socket.on("new_match", handleNewMatch);
    socket.on("recent_matches_updated", handleNewMatch);

    // New conversation events
    socket.on("new_conversation", (data) => {
      if (!data) return;
      newConversationListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    });

    // Typing events (all standard socket.io aliases)
    const handleTypingEvent = (data) => {
      if (!data) return;
      typingListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    };
    ["typing", "typing:start", "user_typing", "display_typing", "typing_start", "typing_user"].forEach((ev) => {
      socket.on(ev, handleTypingEvent);
    });

    // Stop typing events
    const handleStopTypingEvent = (data) => {
      if (!data) return;
      stopTypingListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    };
    ["stop_typing", "typing:stop", "user_stopped_typing", "stopTyping", "typing_stop"].forEach((ev) => {
      socket.on(ev, handleStopTypingEvent);
    });

    // Read receipt / message seen events
    const handleReadReceipt = (data) => {
      if (!data) return;
      readReceiptListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) { }
      });
    };
    [
      "messages_read",
      "message_read",
      "messages_seen",
      "message_seen",
      "read_receipt",
      "readReceipt",
      "mark_read",
      "chat_read",
      "seen",
    ].forEach((ev) => {
      socket.on(ev, handleReadReceipt);
    });

    // Membership & Swipe Quota balance updates
    const handleMembershipUpdated = (data) => {
      if (!data) return;
      membershipListeners.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.warn("Membership listener error:", e);
        }
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pj-membership-updated", { detail: data }));
        if (data?.swipesRemainingToday !== undefined || data?.swipesUsedToday !== undefined) {
          window.dispatchEvent(
            new CustomEvent("pj-swipes-updated", {
              detail: {
                swipesUsedToday: data?.swipesUsedToday,
                swipesRemainingToday: data?.swipesRemainingToday,
                dailySwipeLimit: data?.dailySwipeLimit,
                unlimitedSwipes: data?.subscription?.perks?.unlimitedSwipes,
                subscription: data?.subscription,
              },
            })
          );
        }
      }
    };
    [
      "membership_updated",
      "membershipUpdated",
      "swipe_limit_updated",
      "subscription_updated",
      "superlike_used",
    ].forEach((ev) => {
      socket.on(ev, handleMembershipUpdated);
    });

    // Calls
    const callEvents = [
      "incoming_call",
      "incomingCall",
      "call_user",
      "callUser",
      "call_incoming",
      "callIncoming",
      "call_request",
      "callRequest",
      "call:incoming",
      "call:received",
    ];
    callEvents.forEach((ev) => {
      socket.on(ev, (data) => {
        incomingCallListeners.forEach((cb) => {
          try {
            cb(data);
          } catch (e) { }
        });
      });
    });

    const acceptedEvents = [
      "call_accepted",
      "callAccepted",
      "answer_call",
      "answerCall",
      "call:accepted",
      "call:connected",
    ];
    acceptedEvents.forEach((ev) => {
      socket.on(ev, (data) => {
        callAcceptedListeners.forEach((cb) => {
          try {
            cb(data);
          } catch (e) { }
        });
      });
    });

    const endedEvents = [
      "call_ended",
      "callEnded",
      "end_call",
      "reject_call",
      "call_rejected",
      "call:ended",
      "call:rejected",
    ];
    endedEvents.forEach((ev) => {
      socket.on(ev, (data) => {
        callEndedListeners.forEach((cb) => {
          try {
            cb(data);
          } catch (e) { }
        });
      });
    });

    socket.on("disconnect", () => { });

    socket.on("connect_error", () => { });
  }

  return socket;
};

// Auto-initialize socket in browser
if (typeof window !== "undefined") {
  initSocket();
}

export const getSocket = () => socket || initSocket();
export { initSocket };

export const socketService = {
  /**
   * Connect and join personal room
   */
  connect(userOrId) {
    const sock = initSocket();
    const targetId = (typeof userOrId === "object" ? userOrId?._id || userOrId?.id : userOrId) || getStoredUserId();
    if (sock && targetId) {
      registerUserOnSocket(sock, targetId);
    }
    return sock;
  },

  onOnlineUsersChange(callback) {
    if (typeof callback !== "function") return () => { };
    onlineListeners.add(callback);
    try {
      callback(Array.from(onlineUsers), onlineUsers, lastSeenMap);
    } catch { }
    return () => onlineListeners.delete(callback);
  },

  isUserOnline(userId) {
    if (!userId) return false;
    return onlineUsers.has(String(userId).trim().replace(/^(usr_|conv_|chat_|match_)/, ""));
  },

  getUserLastSeen(userId) {
    if (!userId) return null;
    const strId = String(userId).trim().replace(/^(usr_|conv_|chat_|match_)/, "");
    return lastSeenMap.get(strId) || null;
  },

  getOnlineUsers() {
    return Array.from(onlineUsers);
  },

  getSocket() {
    return socket || initSocket();
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinChat(conversationId) {
    const sock = this.getSocket();
    if (sock && conversationId) {
      const rawId = String(conversationId).trim();
      const cleanId = rawId.replace(/^(usr_|conv_|chat_|match_)/, "");
      sock.emit("join_chat", rawId);
      sock.emit("join_chat", cleanId);
      sock.emit("join_room", rawId);
      sock.emit("join_room", cleanId);
      sock.emit("join_conversation", rawId);
      sock.emit("join_conversation", cleanId);
      sock.emit("join", rawId);
      sock.emit("join", cleanId);
    }
  },

  leaveChat(conversationId) {
    const sock = this.getSocket();
    if (sock && conversationId) {
      const rawId = String(conversationId).trim();
      const cleanId = rawId.replace(/^(usr_|conv_|chat_|match_)/, "");
      sock.emit("leave_chat", rawId);
      sock.emit("leave_chat", cleanId);
      sock.emit("leave_room", rawId);
      sock.emit("leave_room", cleanId);
    }
  },

  emitSendMessage(payload) {
    const sock = this.getSocket();
    if (!sock || !payload) return;
    if (!sock.connected) {
      sock.connect();
    }
    sock.emit("send_message", payload);
  },

  emitTyping({ conversationId, receiverId, user, senderId }) {
    const sock = this.getSocket();
    if (!sock) return;
    const cleanConv = conversationId ? String(conversationId).replace(/^conv_/, "") : "";
    const payload = {
      conversationId: cleanConv,
      chatId: cleanConv,
      roomId: cleanConv,
      receiverId: receiverId || "",
      recipientId: receiverId || "",
      to: receiverId || "",
      senderId: senderId || user?._id || user?.id || currentRegisteredUserId || "",
      userId: senderId || user?._id || user?.id || currentRegisteredUserId || "",
      user: user || null,
    };
    sock.emit("typing", payload);
    sock.emit("typing:start", payload);
    sock.emit("user_typing", payload);
  },

  emitStopTyping({ conversationId, receiverId, user, senderId }) {
    const sock = this.getSocket();
    if (!sock) return;
    const cleanConv = conversationId ? String(conversationId).replace(/^conv_/, "") : "";
    const payload = {
      conversationId: cleanConv,
      chatId: cleanConv,
      roomId: cleanConv,
      receiverId: receiverId || "",
      recipientId: receiverId || "",
      to: receiverId || "",
      senderId: senderId || user?._id || user?.id || currentRegisteredUserId || "",
      userId: senderId || user?._id || user?.id || currentRegisteredUserId || "",
      user: user || null,
    };
    sock.emit("stop_typing", payload);
    sock.emit("typing:stop", payload);
    sock.emit("user_stopped_typing", payload);
  },

  emitMarkRead({ conversationId, readerId, senderId }) {
    const sock = this.getSocket();
    if (!sock) return;
    const cleanConv = conversationId ? String(conversationId).replace(/^conv_/, "") : "";
    const payload = {
      conversationId: cleanConv,
      chatId: cleanConv,
      roomId: cleanConv,
      readerId: readerId || currentRegisteredUserId || "",
      userId: readerId || currentRegisteredUserId || "",
      senderId: senderId || "",
      timestamp: new Date().toISOString(),
    };
    sock.emit("mark_read", payload);
    sock.emit("markAsRead", payload);
    sock.emit("messages_read", payload);
    sock.emit("message_read", payload);
    sock.emit("messages_seen", payload);
    sock.emit("message_seen", payload);
    sock.emit("read_receipt", payload);
  },

  onReadReceipt(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    readReceiptListeners.add(callback);
    return () => {
      readReceiptListeners.delete(callback);
    };
  },

  onMessageReceived(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    messageListeners.add(callback);
    return () => {
      messageListeners.delete(callback);
    };
  },

  onConversationUpdated(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    conversationListeners.add(callback);
    return () => {
      conversationListeners.delete(callback);
    };
  },

  onMembershipUpdated(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    membershipListeners.add(callback);
    return () => {
      membershipListeners.delete(callback);
    };
  },

  onNewMatch(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    matchListeners.add(callback);
    return () => {
      matchListeners.delete(callback);
    };
  },

  onNewMatchNotification(callback) {
    return this.onNewMatch(callback);
  },

  onNewConversation(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    newConversationListeners.add(callback);
    return () => {
      newConversationListeners.delete(callback);
    };
  },

  onTyping(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    typingListeners.add(callback);
    return () => {
      typingListeners.delete(callback);
    };
  },

  onStopTyping(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    stopTypingListeners.add(callback);
    return () => {
      stopTypingListeners.delete(callback);
    };
  },

  emitInitiateCall({ to, channelName, callType, caller, conversationId, token }) {
    const sock = this.getSocket();
    if (!sock) return;
    const toId = String(to || "").trim();
    const convId = String(conversationId || "").trim();
    const chName = String(channelName || `prem_jodo_${convId || toId || "room"}`).trim();
    const cType = callType || "video";

    const payload = {
      to: toId,
      receiverId: toId,
      recipientId: toId,
      userToCall: toId,
      targetUserId: toId,
      targetId: toId,
      channelName: chName,
      channel: chName,
      callType: cType,
      type: cType,
      caller: {
        id: caller?.id || caller?._id || "",
        _id: caller?.id || caller?._id || "",
        name: caller?.name || "Match Partner",
        avatar: caller?.avatar || "",
      },
      from: caller?.id || caller?._id || "",
      callerId: caller?.id || caller?._id || "",
      callerName: caller?.name || "Match Partner",
      callerAvatar: caller?.avatar || "",
      conversationId: convId,
      chatId: convId,
      roomId: convId || chName,
      token,
    };

    sock.emit("call_user", payload);
    sock.emit("callUser", payload);
    sock.emit("initiate_call", payload);
    sock.emit("call:initiate", payload);
  },

  emitAnswerCall({ to, channelName, conversationId }) {
    const sock = this.getSocket();
    if (!sock) return;
    const toId = String(to || "").trim();
    const convId = String(conversationId || "").trim();
    const chName = String(channelName || "").trim();

    const payload = {
      to: toId,
      receiverId: toId,
      callerId: toId,
      channelName: chName,
      conversationId: convId,
      chatId: convId,
    };

    sock.emit("call:accept", payload);
    sock.emit("call_accepted", payload);
    sock.emit("answer_call", payload);
  },

  emitEndCall({ to, channelName, conversationId }) {
    const sock = this.getSocket();
    if (!sock) return;
    const toId = String(to || "").trim();
    const convId = String(conversationId || "").trim();
    const chName = String(channelName || "").trim();

    const payload = {
      to: toId,
      receiverId: toId,
      channelName: chName,
      conversationId: convId,
      chatId: convId,
    };

    sock.emit("call:end", payload);
    sock.emit("call_ended", payload);
    sock.emit("end_call", payload);
  },

  onIncomingCall(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    incomingCallListeners.add(callback);
    return () => incomingCallListeners.delete(callback);
  },

  onCallAccepted(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    callAcceptedListeners.add(callback);
    return () => callAcceptedListeners.delete(callback);
  },

  onCallEnded(callback) {
    if (typeof callback !== "function") return () => { };
    initSocket();
    callEndedListeners.add(callback);
    return () => callEndedListeners.delete(callback);
  },
};

export default socketService;
