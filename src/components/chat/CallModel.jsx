"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  SwitchCamera,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Heart,
} from "lucide-react";
import { AgoraCallManager } from "@/lib/agora/agoraClient";
import chatService from "@/lib/services/chat.service";
import socketService from "@/lib/services/socket.service";

import authService from "@/lib/services/auth.service";
import callSoundService from "@/lib/services/callSound.service";
import { resolveImageUrl } from "@/lib/utility/imageUrl";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

export function CallModel({
  match,
  callType = "video", // "video" or "audio"
  isIncoming = false,
  onClose,
}) {
  const [currentCallType, setCurrentCallType] = useState(callType || "video");
  const [callStatus, setCallStatus] = useState(
    isIncoming || match?.isIncoming ? "connected" : "calling"
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(callType === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const agoraManagerRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const isVideoActive = currentCallType === "video" || !isVideoDisabled || hasRemoteVideo;

  const rawPartnerAvatar =
    (match?.userAvatar && String(match.userAvatar).trim().length > 0)
      ? match.userAvatar
      : (match?.callerAvatar && String(match.callerAvatar).trim().length > 0)
      ? match.callerAvatar
      : (match?.avatar && String(match.avatar).trim().length > 0)
      ? match.avatar
      : "";
  const partnerAvatar = resolveImageUrl(rawPartnerAvatar, DEFAULT_AVATAR);

  // Sound Management for Outgoing Ringback and Connection
  useEffect(() => {
    if (isIncoming || match?.isIncoming) {
      callSoundService.stopAll();
      return;
    }

    if (callStatus === "calling" || callStatus === "ringing") {
      callSoundService.startOutgoingRingback();
    } else if (callStatus === "connected") {
      callSoundService.stopOutgoingRingback();
    }

    return () => {
      callSoundService.stopOutgoingRingback();
    };
  }, [callStatus, isIncoming, match?.isIncoming]);

  // Call status progression
  useEffect(() => {
    if (isIncoming || match?.isIncoming) return;

    const ringTimer = setTimeout(() => {
      setCallStatus((prev) => (prev === "calling" ? "ringing" : prev));
    }, 1500);

    return () => {
      clearTimeout(ringTimer);
    };
  }, [isIncoming, match?.isIncoming]);

  // Duration timer when connected
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Ensure remote video stream is attached when remote video turns on
  useEffect(() => {
    if (hasRemoteVideo && remoteVideoRef.current && agoraManagerRef.current?.client) {
      const remoteUsers = agoraManagerRef.current.client.remoteUsers || [];
      for (const rUser of remoteUsers) {
        if (rUser.hasVideo && rUser.videoTrack) {
          rUser.videoTrack.play(remoteVideoRef.current);
        }
      }
    }
  }, [hasRemoteVideo]);

  // Ensure local video stream is attached when local video turns on
  useEffect(() => {
    if (!isVideoDisabled && localVideoRef.current && agoraManagerRef.current) {
      agoraManagerRef.current.playLocalVideo(localVideoRef.current);
    }
  }, [isVideoDisabled]);

  // Agora and Media Stream initialization
  useEffect(() => {
    let isCancelled = false;

    async function startMedia() {
      const convId = match?.conversationId || match?._id || match?.id;
      const partnerId = match?.partnerUserId || match?.userId || match?.partnerId || match?.partner?._id || match?.id;
      const forcedChannel = match?.channelName || match?.channel || (convId ? `prem_jodo_${convId}` : `prem_jodo_room_${partnerId || "call"}`);

      const storedUser = typeof window !== "undefined" ? authService.getUser() : null;
      const storedProfile = typeof window !== "undefined" ? authService.getProfile() : null;
      const myId = storedUser?._id || storedUser?.id || storedProfile?._id || "";
      const myName = match?.myUserName || storedUser?.fullName || storedUser?.name || storedProfile?.fullName || storedProfile?.firstName || "Match Partner";
      const rawMyAvatar = match?.myUserAvatar || storedProfile?.photos?.[0]?.url || storedProfile?.photos?.[0] || storedProfile?.photo || storedUser?.avatar || "";
      const myAvatar = resolveImageUrl(rawMyAvatar, DEFAULT_AVATAR);

      let callConfig = null;
      try {
        callConfig = await chatService.getCallToken(convId, {
          channelName: forcedChannel,
          callType,
          receiverId: partnerId,
        });
      } catch (e) {}

      if (isCancelled) return;

      const activeToken = callConfig?.token || match?.token;

      // 2. Notify recipient via WebSocket only if initiator
      if (partnerId && !isIncoming && !match?.isIncoming) {
        socketService.emitInitiateCall({
          to: partnerId,
          channelName: forcedChannel,
          callType,
          caller: {
            id: myId,
            _id: myId,
            name: myName,
            avatar: myAvatar,
          },
          conversationId: convId,
          token: activeToken,
        });
      }

      // 3. Initialize Agora Call Manager with exact identical channel name
      const agora = new AgoraCallManager({
        appId: callConfig?.appId,
        channel: forcedChannel,
        token: activeToken,
        uid: callConfig?.uid,
        onUserJoined: (user) => {
          setCallStatus("connected");
        },
        onRemoteTrack: (user, mediaType) => {
          setCallStatus("connected");
          if (mediaType === "video") {
            setHasRemoteVideo(true);
            setCurrentCallType("video");
            if (remoteVideoRef.current) {
              user.videoTrack?.play(remoteVideoRef.current);
            }
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        },
        onRemoteTrackUnpublished: (user, mediaType) => {
          if (mediaType === "video") {
            setHasRemoteVideo(false);
          }
        },
        onUserLeft: (user) => {
          setHasRemoteVideo(false);
        },
      });
      agoraManagerRef.current = agora;

      let joined = false;
      try {
        joined = await agora.joinCall({ isVideo: callType === "video" && !isVideoDisabled });
        if (joined && localVideoRef.current && !isVideoDisabled) {
          agora.playLocalVideo(localVideoRef.current);
        }
      } catch (err) {}

      // Fallback local preview only if Agora could not join
      if (!joined && callType === "video" && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: isFrontCamera ? "user" : "environment" },
            audio: true,
          });
          if (!isCancelled) {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              const videoEl = document.createElement("video");
              videoEl.autoplay = true;
              videoEl.playsInline = true;
              videoEl.muted = true;
              videoEl.srcObject = stream;
              videoEl.className = "w-full h-full object-cover transform scale-x-[-1]";
              localVideoRef.current.innerHTML = "";
              localVideoRef.current.appendChild(videoEl);
            }
          }
        } catch (e) {
          console.warn("Camera access permission denied or unavailable:", e);
        }
      }
    }

    startMedia();

    // Listen for call accepted or ended by remote partner
    const unsubAccepted = socketService.onCallAccepted(() => {
      callSoundService.stopOutgoingRingback();
      setCallStatus("connected");
    });

    const unsubEnded = socketService.onCallEnded(() => {
      callSoundService.playCallEndTone();
      if (onClose) onClose();
    });

    return () => {
      isCancelled = true;
      if (unsubAccepted) unsubAccepted();
      if (unsubEnded) unsubEnded();
      callSoundService.stopAll();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (agoraManagerRef.current) {
        agoraManagerRef.current.leave();
      }
    };
  }, [callType, isFrontCamera, match?.id, match?.conversationId, match?.partnerUserId, match?.channelName]);

  const handleEndCall = () => {
    callSoundService.playCallEndTone();
    const convId = match?.conversationId || match?._id || match?.id;
    const partnerId = match?.partnerUserId || match?.id;
    if (partnerId) {
      socketService.emitEndCall({
        to: partnerId,
        channelName: match?.channelName || `prem_jodo_${convId}`,
        conversationId: convId,
      });
    }
    if (onClose) onClose();
  };

  const handleToggleMute = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (agoraManagerRef.current) {
      await agoraManagerRef.current.toggleAudio(nextMuted);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMuted;
      });
    }
  };

  const handleToggleVideo = async () => {
    const nextDisabled = !isVideoDisabled;
    setIsVideoDisabled(nextDisabled);
    if (!nextDisabled) {
      setCurrentCallType("video");
    }
    if (agoraManagerRef.current) {
      await agoraManagerRef.current.toggleVideo(nextDisabled);
      if (!nextDisabled) {
        setTimeout(() => {
          if (localVideoRef.current && agoraManagerRef.current) {
            agoraManagerRef.current.playLocalVideo(localVideoRef.current);
          }
        }, 150);
      }
    }
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !nextDisabled;
      });
    }
  };

  const handleFlipCamera = async () => {
    setIsFrontCamera((prev) => !prev);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isFullscreen ? "h-full max-w-none" : "max-w-md sm:max-w-lg h-[640px] max-h-[92vh]"
        } bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-zinc-800 transition-all`}
      >
        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-rose-300 bg-rose-950/70 border border-rose-800/60 text-[11px] poppins-medium px-3 py-1 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              Prem Jodo Encrypted
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center Calling Display */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
          {isVideoActive ? (
            /* Video Call View */
            <div className="absolute inset-0 w-full h-full bg-zinc-950 flex items-center justify-center">
              {/* Agora Remote Stream Attachment */}
              <div
                ref={remoteVideoRef}
                id="agora-remote-player"
                className={`absolute inset-0 w-full h-full z-10 [&>video]:w-full [&>video]:h-full [&>video]:object-cover ${
                  hasRemoteVideo ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              />

              {/* Remote Match Display / Stream Poster */}
              <div
                className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
                  hasRemoteVideo ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <img
                  src={partnerAvatar}
                  alt={match?.userName || "Match"}
                  className="w-full h-full object-cover filter blur-md scale-110 opacity-35"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <div className="relative mb-4">
                    <div className="p-1 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-2xl shadow-rose-500/30">
                      <img
                        src={partnerAvatar}
                        alt={match?.userName || "Match"}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-zinc-900"
                      />
                    </div>
                    {callStatus !== "connected" && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[11px] poppins-semibold tracking-wide animate-pulse shadow-md">
                        {callStatus === "calling" ? "Calling..." : "Ringing..."}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl poppins-bold tracking-tight text-white mb-1">
                    {match?.userName || "Match Partner"}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    {callStatus === "connected" ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 poppins-semibold text-sm bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Connected • {formatDuration(duration)}
                      </span>
                    ) : (
                      <p className="text-sm poppins-medium text-rose-400">Prem Jodo Video Call</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connected Banner when remote video is live */}
              {callStatus === "connected" && hasRemoteVideo && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs poppins-semibold text-white">{match?.userName || "Connected"}</span>
                  <span className="text-xs poppins-medium text-emerald-300">({formatDuration(duration)})</span>
                </div>
              )}

              {/* Local User PiP Video Preview */}
              <div className="absolute top-4 right-4 w-28 h-40 sm:w-32 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-rose-500/50 bg-zinc-900 z-30 flex items-center justify-center">
                <div
                  ref={localVideoRef}
                  id="agora-local-player"
                  className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover transform scale-x-[-1]"
                />
                <span className="absolute bottom-1.5 left-2 text-[10px] poppins-medium bg-black/70 px-2 py-0.5 rounded-md text-white backdrop-blur-xs z-20 pointer-events-none">
                  You
                </span>
              </div>
            </div>
          ) : (
            /* Audio Call View */
            <div className="flex flex-col items-center justify-center z-10 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="relative">
                {/* Pulsing ring for audio */}
                <div
                  className={`absolute -inset-4 rounded-full bg-rose-500/25 ${
                    callStatus === "connected" ? "animate-ping opacity-40" : "animate-pulse"
                  }`}
                />
                <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-2xl shadow-rose-500/30">
                  <img
                    src={partnerAvatar}
                    alt={match?.userName || "Match"}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-zinc-950"
                  />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-2xl poppins-bold text-white flex items-center justify-center gap-1.5">
                  {match?.userName || "Match Partner"}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${callStatus === "connected" ? "bg-emerald-400" : "bg-rose-500"} animate-pulse`} />
                  <p className={`text-sm poppins-semibold ${callStatus === "connected" ? "text-emerald-400" : "text-rose-400"}`}>
                    {callStatus === "connected"
                      ? `Connected • ${formatDuration(duration)}`
                      : callStatus === "calling"
                      ? "Calling..."
                      : "Ringing..."}
                  </p>
                </div>
                <p className="text-xs poppins-medium text-zinc-400 pt-1 flex items-center justify-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Prem Jodo HD Audio
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Calling Control Bar */}
        <div className="relative z-20 px-6 py-6 bg-gradient-to-t from-black via-zinc-950/90 to-transparent">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Speaker Toggle */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer shadow-lg ${
                isSpeakerOn
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-zinc-700 text-zinc-400"
              }`}
              title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer shadow-lg ${
                !isVideoDisabled
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
              title={isVideoDisabled ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Mic Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer shadow-lg ${
                !isMuted
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Switch Camera */}
            {isVideoActive && !isVideoDisabled && (
              <button
                onClick={handleFlipCamera}
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all cursor-pointer shadow-lg"
                title="Switch Camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-95 text-white shadow-xl shadow-rose-600/40 transition-all cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Aliases
export const callModel = CallModel;
export default CallModel;
