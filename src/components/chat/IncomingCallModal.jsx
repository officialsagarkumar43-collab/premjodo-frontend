"use client";

import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, ShieldCheck } from "lucide-react";
import callSoundService from "@/lib/services/callSound.service";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

export function IncomingCallModal({ incomingCall, onAccept, onReject }) {
  useEffect(() => {
    if (incomingCall) {
      callSoundService.startIncomingRingtone();
    }
    return () => {
      callSoundService.stopIncomingRingtone();
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    callSoundService.stopIncomingRingtone();
    if (onAccept) onAccept();
  };

  const handleReject = () => {
    callSoundService.stopIncomingRingtone();
    if (onReject) onReject();
  };

  const isVideo = incomingCall.callType === "video";
  const callerName = incomingCall.caller?.name || incomingCall.callerName || "Match Partner";
  const rawCallerAvatar =
    (incomingCall.caller?.avatar && String(incomingCall.caller.avatar).trim().length > 0)
      ? incomingCall.caller.avatar
      : (incomingCall.callerAvatar && String(incomingCall.callerAvatar).trim().length > 0)
      ? incomingCall.callerAvatar
      : "";
  const callerAvatar = resolveImageUrl(
    rawCallerAvatar,
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* Encrypted Pill */}
        <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/70 border border-rose-800/60 text-[11px] poppins-medium px-3.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          Prem Jodo Encrypted Call
        </div>

        {/* Pulsing Avatar */}
        <div className="relative my-2">
          <div className="absolute -inset-4 rounded-full bg-rose-500/25 animate-ping opacity-60" />
          <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-2xl shadow-rose-500/30">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-zinc-950"
            />
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl poppins-bold text-white truncate max-w-xs">{callerName}</h3>
          <p className="text-xs sm:text-sm poppins-semibold text-rose-400 flex items-center justify-center gap-2">
            {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span>Incoming {isVideo ? "Video" : "Audio"} Call...</span>
          </p>
        </div>

        {/* Action Buttons: Decline (Red) & Accept (Green) */}
        <div className="flex items-center justify-center gap-8 pt-4 w-full">
          {/* Decline Button */}
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            title="Decline Call"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all active:scale-95 group-hover:scale-105">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs poppins-semibold text-zinc-400 group-hover:text-red-400">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            title="Accept Call"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all active:scale-95 group-hover:scale-105 animate-bounce">
              {isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </div>
            <span className="text-xs poppins-semibold text-zinc-400 group-hover:text-emerald-400">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallModal;
