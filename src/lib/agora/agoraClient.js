/**
 * Agora RTC Client Manager
 * Handles video and audio calling channels, track management, and events.
 */

let AgoraRTC = null;


// Dynamically import AgoraRTC to ensure SSR safety in Next.js
export async function getAgoraRTC() {
  if (typeof window === "undefined") return null;
  if (!AgoraRTC) {
    const module = await import("agora-rtc-sdk-ng");
    AgoraRTC = module.default || module;
    try {
      if (typeof AgoraRTC.setLogLevel === "function") {
        AgoraRTC.setLogLevel(4); // 4: NONE (completely silent)
      }
      if (typeof AgoraRTC.disableLogUpload === "function") {
        AgoraRTC.disableLogUpload();
      }
      if (typeof AgoraRTC.setParameter === "function") {
        AgoraRTC.setParameter("ENABLE_LOG_UPLOAD", false);
        AgoraRTC.setParameter("ENABLE_STAT_COLLECTOR", false);
        AgoraRTC.setParameter("ENABLE_REPORT", false);
        AgoraRTC.setParameter("DISABLE_METRICS", true);
        AgoraRTC.setParameter("DISABLE_REPORT", true);
        AgoraRTC.setParameter("REPORT_LEVEL", 0);
      }
    } catch {}
  }
  return AgoraRTC;
}

export class AgoraCallManager {
  constructor({ appId, channel, token = null, uid = null, onUserJoined, onUserLeft, onRemoteTrack, onRemoteTrackUnpublished }) {
    this.appId = appId || process.env.NEXT_PUBLIC_AGORA_APP_ID;
    this.channel = channel;
    this.token = token && String(token).trim().length > 10 ? String(token).trim() : null;
    this.uid = uid !== undefined && uid !== null ? uid : null;
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = [];
    this.onUserJoined = onUserJoined;
    this.onUserLeft = onUserLeft;
    this.onRemoteTrack = onRemoteTrack;
    this.onRemoteTrackUnpublished = onRemoteTrackUnpublished;
  }

  async init() {
    const rtc = await getAgoraRTC();
    if (!rtc) return null;

    this.client = rtc.createClient({ mode: "rtc", codec: "vp8" });

    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (this.onRemoteTrack) {
        this.onRemoteTrack(user, mediaType);
      }
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      if (this.onRemoteTrackUnpublished) {
        this.onRemoteTrackUnpublished(user, mediaType);
      }
    });

    this.client.on("user-joined", (user) => {
      this.remoteUsers.push(user);
      if (this.onUserJoined) this.onUserJoined(user);
    });

    this.client.on("user-left", (user) => {
      this.remoteUsers = this.remoteUsers.filter((u) => u.uid !== user.uid);
      if (this.onUserLeft) this.onUserLeft(user);
    });

    return this.client;
  }

  async joinCall({ isVideo = true }) {
    const rtc = await getAgoraRTC();
    if (!rtc) return false;

    const trimmedAppId = (this.appId || "").trim();
    const is32Hex = /^[0-9a-fA-F]{32}$/.test(trimmedAppId);

    if (!is32Hex) {
      console.warn(
        `⚠️ Agora App ID is invalid (${trimmedAppId ? "received: " + trimmedAppId.slice(0, 6) + "..." : "empty"}). Agora App ID must be a 32-character hexadecimal string from Agora Console (https://console.agora.io). Video/Audio preview will use local media.`
      );
      return false;
    }

    if (!this.token || String(this.token).trim().length < 10) {
      console.warn(
        "⚠️ Agora RTC Token is required because your Agora Project has App Certificate enabled. Please connect the backend Agora token endpoint. Video/Audio preview is active in local mode."
      );
      return false;
    }

    try {
      if (!this.client) {
        await this.init();
      }

      let joinSuccess = false;
      let lastError = null;

      const uidAttempts = [
        this.uid !== null && this.uid !== undefined ? this.uid : 0,
        0,
        null,
      ];

      for (const attemptUid of uidAttempts) {
        try {
          const assignedUid = await this.client.join(trimmedAppId, this.channel, this.token, attemptUid);
          this.uid = assignedUid || this.client?.uid || attemptUid;
          joinSuccess = true;
          console.log(`✅ Agora joined channel ${this.channel} successfully with Assigned UID: ${this.uid}`);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Agora join attempt with UID (${attemptUid}) failed:`, err?.message || err);
          if (err?.message?.includes("ALREADY_JOINED") || err?.code === "ALREADY_JOINED") {
            joinSuccess = true;
            break;
          }
        }
      }

      if (!joinSuccess && lastError) {
        throw lastError;
      }

      // Check if remote users are already present in the channel
      if (this.client.remoteUsers && this.client.remoteUsers.length > 0) {
        console.log("🔗 Found existing remote users in Agora channel:", this.client.remoteUsers);
        for (const rUser of this.client.remoteUsers) {
          if (this.onUserJoined) this.onUserJoined(rUser);
          if (rUser.hasAudio) {
            try {
              await this.client.subscribe(rUser, "audio");
              if (this.onRemoteTrack) this.onRemoteTrack(rUser, "audio");
            } catch (err) {
              console.warn("Audio subscribe error:", err);
            }
          }
          if (rUser.hasVideo) {
            try {
              await this.client.subscribe(rUser, "video");
              if (this.onRemoteTrack) this.onRemoteTrack(rUser, "video");
            } catch (err) {
              console.warn("Video subscribe error:", err);
            }
          }
        }
      }

      if (isVideo) {
        const [audioTrack, videoTrack] = await rtc.createMicrophoneAndCameraTracks();
        this.localAudioTrack = audioTrack;
        this.localVideoTrack = videoTrack;
        await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      } else {
        const audioTrack = await rtc.createMicrophoneAudioTrack();
        this.localAudioTrack = audioTrack;
        await this.client.publish([this.localAudioTrack]);
      }

      return true;
    } catch (error) {
      console.warn("ℹ️ Agora RTC connection note (local preview active):", error?.message || error?.code || error);
      if (this.client) {
        try {
          await this.client.leave();
        } catch { }
      }
      return false;
    }
  }

  playLocalVideo(containerElement) {
    if (this.localVideoTrack && containerElement) {
      this.localVideoTrack.play(containerElement);
    }
  }

  async toggleAudio(mute) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setMuted(mute);
      return !mute;
    }
    return false;
  }

  async toggleVideo(disable) {
    const rtc = await getAgoraRTC();
    if (!this.client) return false;

    if (!disable) {
      if (!this.localVideoTrack) {
        try {
          if (rtc) {
            this.localVideoTrack = await rtc.createCameraVideoTrack();
            await this.client.publish([this.localVideoTrack]);
            console.log("📹 Dynamic local video track published successfully");
          }
        } catch (e) {
          console.warn("Could not dynamically start camera track:", e);
          return false;
        }
      } else {
        await this.localVideoTrack.setEnabled(true);
      }
      return this.localVideoTrack;
    } else {
      if (this.localVideoTrack) {
        await this.localVideoTrack.setEnabled(false);
      }
      return false;
    }
  }

  async leave() {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      if (this.client) {
        await this.client.leave();
        this.client = null;
      }
    } catch (e) {
      console.warn("Error leaving call:", e);
    }
  }
}
