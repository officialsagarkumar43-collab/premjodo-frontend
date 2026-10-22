/**
 * Chat & Conversation API Service for Prem Jodo
 * Integrates with Backend:
 * - GET /api/v1/chat/conversations
 * - GET /api/v1/chat/conversations/:id/messages
 * - POST /api/v1/chat/conversations/:id/messages
 * - PATCH /api/v1/chat/conversations/:id/read
 */

import { apiFetch } from "./apiClient";
import { socketService } from "./socket.service";

let inFlightConversationsPromise = null;
const cachedConversationsMap = new Map();
const cachedMessagesMap = new Map();
const recentReadCalls = new Map();

function populateCache(conversations) {
  if (!Array.isArray(conversations)) return;
  for (const conv of conversations) {
    if (!conv) continue;
    const convId = String(conv._id || conv.id || "").replace(/^conv_/, "");
    if (convId) {
      cachedConversationsMap.set(convId, conv);
      if (Array.isArray(conv.messages)) {
        cachedMessagesMap.set(convId, conv.messages);
      }
    }
  }
}

export const chatService = {
  /**
   * Fetch all user conversations (with in-flight deduplication and embedded messages caching)
   * @returns {Promise<Array>}
   */
  async getConversations(force = false) {
    if (!force && inFlightConversationsPromise) {
      return inFlightConversationsPromise;
    }

    inFlightConversationsPromise = (async () => {
      try {
        const response = await apiFetch("/chat/conversations", {
          method: "GET",
        });

        if (!response || !response.ok) {
          return Array.from(cachedConversationsMap.values());
        }

        const resData = await response.json().catch(() => ({}));

        if (resData?.success === false) {
          return [];
        }

        // Support { data: { conversations: [...] } }, { data: [...] }, or { conversations: [...] }
        const rawList = Array.isArray(resData?.data?.conversations)
          ? resData.data.conversations
          : Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData?.conversations)
          ? resData.conversations
          : [];

        populateCache(rawList);
        return rawList;
      } catch (error) {
        console.warn("getConversations note:", error?.message || error);
        return Array.from(cachedConversationsMap.values());
      } finally {
        setTimeout(() => {
          inFlightConversationsPromise = null;
        }, 1500);
      }
    })();

    return inFlightConversationsPromise;
  },

  /**
   * Fetch messages for a specific conversation from in-memory cache / conversation response
   * @param {string} conversationId
   * @returns {Promise<Array>}
   */
  async getMessages(conversationId) {
    if (!conversationId) return [];
    const cleanId = String(conversationId).replace(/^conv_/, "");

    // 1. Check if messages are already cached in memory
    if (cachedMessagesMap.has(cleanId)) {
      return cachedMessagesMap.get(cleanId) || [];
    }

    // 2. Fetch conversations to populate cache without making separate messages API calls
    try {
      const convList = await this.getConversations();
      if (cachedMessagesMap.has(cleanId)) {
        return cachedMessagesMap.get(cleanId) || [];
      }
      const match = convList.find((c) => {
        const cId = String(c._id || c.id || "").replace(/^conv_/, "");
        return cId === cleanId;
      });
      if (match && Array.isArray(match.messages)) {
        cachedMessagesMap.set(cleanId, match.messages);
        return match.messages;
      }
    } catch (err) {
      console.warn("getMessages note:", err.message);
    }

    return [];
  },

  /**
   * Send a message in a conversation via pure WebSocket (No HTTP POST)
   * @param {string} conversationId
   * @param {Object} payload - { content, mediaUrl, mediaType, senderId, receiverId }
   * @returns {Promise<Object>}
   */
  async sendMessage(conversationId, { content, mediaUrl, mediaType, senderId, receiverId } = {}) {
    if (!conversationId) return { success: false, message: "Conversation ID is required" };
    const cleanId = String(conversationId).replace(/^conv_/, "");

    try {
      socketService.emitSendMessage({
        conversationId: cleanId,
        chatId: cleanId,
        roomId: cleanId,
        senderId,
        receiverId,
        content: content || "",
        text: content || "",
        message: content || "",
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Socket sendMessage error:", err);
    }

    return { success: true, message: "Dispatched via WebSocket" };
  },

  /**
   * Mark all unread messages as read in conversation (deduplicated per conversationId)
   * @param {string} conversationId
   * @returns {Promise<Object>}
   */
  async markAsRead(conversationId) {
    if (!conversationId) return;
    const cleanId = String(conversationId).replace(/^conv_/, "");
    if (!cleanId) return;

    const now = Date.now();
    const lastCall = recentReadCalls.get(cleanId) || 0;
    if (now - lastCall < 3500) {
      // Deduplicate rapid duplicate calls within 3.5 seconds
      return { success: true, cached: true };
    }
    recentReadCalls.set(cleanId, now);

    try {
      const response = await apiFetch(`/chat/conversations/${cleanId}/read`, {
        method: "PATCH",
      });

      if (response && response.ok) {
        return await response.json().catch(() => ({}));
      }
    } catch {}
  },

  /**
   * Clear all messages in a conversation
   * @param {string} conversationId
   * @returns {Promise<boolean>}
   */
  async clearMessages(conversationId) {
    if (!conversationId) return false;
    const cleanId = String(conversationId).replace(/^conv_/, "");

    try {
      const response = await apiFetch(`/chat/conversations/${cleanId}/messages`, {
        method: "DELETE",
      }).catch(() => null);

      if (response && response.ok) {
        return true;
      }

      await apiFetch(`/chat/${cleanId}/clear`, {
        method: "POST",
      }).catch(() => null);

      return true;
    } catch (err) {
      console.warn("clearMessages API note:", err);
      return true;
    }
  },

  /**
   * Fetch Agora RTC call token and channel details from backend
   * @param {string} conversationId
   * @param {Object} options - { channelName, callType, receiverId }
   * @returns {Promise<Object>} { token, appId, channel, uid }
   */
  async getCallToken(conversationId, { channelName, callType = "video", receiverId } = {}) {
    const cleanId = conversationId ? String(conversationId).replace(/^conv_/, "") : "";
    const defaultChannel = channelName || (cleanId ? `prem_jodo_${cleanId}` : `prem_jodo_call_${Date.now()}`);

    const candidateEndpoints = [
      { url: `/chat/agora/token?channelName=${defaultChannel}&channel=${defaultChannel}&callType=${callType}&conversationId=${cleanId}`, method: "GET" },
      { url: `/chat/conversations/${cleanId}/call-token?callType=${callType}&channel=${defaultChannel}`, method: "GET" },
      { url: `/chat/call/token`, method: "POST", body: { conversationId: cleanId, channelName: defaultChannel, channel: defaultChannel, callType, receiverId } },
      { url: `/chat/conversations/${cleanId}/call`, method: "POST", body: { callType, channelName: defaultChannel, channel: defaultChannel, receiverId } },
      { url: `/chat/agora-token?channel=${defaultChannel}&type=${callType}`, method: "GET" },
      { url: `/agora/token?channel=${defaultChannel}`, method: "GET" },
    ];

    for (const ep of candidateEndpoints) {
      if (ep.url.includes("//") || (!cleanId && ep.url.includes("conversations/"))) continue;
      try {
        console.log(`[Agora Call] Requesting token from: ${ep.method} ${ep.url}`);
        const response = await apiFetch(ep.url, {
          method: ep.method,
          ...(ep.body ? { body: JSON.stringify(ep.body) } : {}),
        });

        console.log(`[Agora Call] Response status: ${response.status}`);
        if (response.ok) {
          const resData = await response.json().catch(() => ({}));
          const data = resData?.data || resData;
          console.log("[Agora Call] Received backend data:", data);
          if (data && (data.token || data.agoraToken || data.rtcToken || data.appId || data.channel || data.channelName)) {
            return {
              token: data.token || data.agoraToken || data.rtcToken || null,
              appId: data.appId || data.agoraAppId || process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
              channel: data.channelName || data.channel || defaultChannel,
              uid: data.uid !== undefined ? data.uid : null,
            };
          }
        }
      } catch (err) {
        console.warn(`[Agora Call] Failed on ${ep.url}:`, err.message);
      }
    }

    console.warn("[Agora Call] ⚠️ No backend token endpoint responded with a valid token. Token is null.");
    return {
      token: null,
      appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
      channel: defaultChannel,
      uid: null,
    };
  },
};

export default chatService;
