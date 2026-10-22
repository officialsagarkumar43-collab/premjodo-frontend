"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import socketService from "@/lib/services/socket.service";
import authService from "@/lib/services/auth.service";
import "@/lib/agora/agoraClient";
import { IncomingCallModal } from "./IncomingCallModal";
import { CallModel } from "./CallModel";

export function GlobalCallListener() {
  const { user, profile, isAuthenticated } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callMatch, setCallMatch] = useState(null);

  // Initialize socket globally and listen for incoming calls
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
    const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;
    const currentUserId = user?._id || user?.id || storedUser?._id || storedUser?.id || profile?._id || storedProfile?._id;

    if (currentUserId) {
      socketService.connect(currentUserId);
    }

    const unsubIncoming = socketService.onIncomingCall((callData) => {
      if (!callData) return;

      // Ignore incoming call if it was emitted by self
      const myId = String(currentUserId || "");
      const callerId = String(callData.from || callData.caller?.id || callData.caller?._id || "");
      if (myId && callerId && myId === callerId) {
        return;
      }

      setIncomingCall(callData);
    });

    const unsubCallEnded = socketService.onCallEnded(() => {
      setIncomingCall(null);
      setActiveCall(null);
      setCallMatch(null);
    });

    return () => {
      if (unsubIncoming) unsubIncoming();
      if (unsubCallEnded) unsubCallEnded();
    };
  }, [user, profile, isAuthenticated]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;

    const callerId = incomingCall.from || incomingCall.caller?.id || incomingCall.caller?._id;
    const channelName = incomingCall.channelName || incomingCall.channel;
    const convId = incomingCall.conversationId || incomingCall.chatId || channelName;
    const callType = incomingCall.callType || incomingCall.type || "video";

    socketService.emitAnswerCall({
      to: callerId,
      channelName,
      conversationId: convId,
    });

    setCallMatch({
      id: convId,
      conversationId: convId,
      channelName,
      userName: incomingCall.callerName || incomingCall.caller?.name || "Match Partner",
      userAvatar: incomingCall.callerAvatar || incomingCall.caller?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      partnerUserId: callerId,
      isIncoming: true,
      token: incomingCall.token,
    });

    setActiveCall(callType);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    const callerId = incomingCall.from || incomingCall.caller?.id || incomingCall.caller?._id;
    const channelName = incomingCall.channelName || incomingCall.channel;
    const convId = incomingCall.conversationId || incomingCall.chatId || channelName;

    socketService.emitEndCall({
      to: callerId,
      channelName,
      conversationId: convId,
    });

    setIncomingCall(null);
  };

  return (
    <>
      {/* Global Incoming Call Alert (Visible on ANY page) */}
      {incomingCall && !activeCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Global Live Call Screen when answered */}
      {activeCall && callMatch && (
        <CallModel
          match={callMatch}
          callType={activeCall}
          isIncoming={true}
          onClose={() => {
            setActiveCall(null);
            setCallMatch(null);
          }}
        />
      )}
    </>
  );
}

export default GlobalCallListener;
