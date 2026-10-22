/**
 * Call Sound Service
 * High-fidelity, zero-dependency audio synthesizer using Web Audio API
 * Generates realistic incoming call ringtones, outgoing ringback dial tones, and call-end sounds.
 */

class CallSoundService {
  constructor() {
    this.audioCtx = null;
    this.incomingInterval = null;
    this.outgoingInterval = null;
    this.isIncomingPlaying = false;
    this.isOutgoingPlaying = false;
    this.activeNodes = new Set();
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Helper to safely play a single synth note
  playTone(frequency, duration, type = "sine", gainLevel = 0.25, startTimeOffset = 0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + startTimeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);

      // Smooth envelope attack and decay to prevent clicking
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);

      this.activeNodes.add(osc);
      osc.onended = () => {
        this.activeNodes.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch (e) {
      console.warn("Tone play error:", e);
    }
  }

  /**
   * Start Incoming Call Ringtone
   * Melodic modern smartphone chime chord sequence (E5, G#5, B5, E6, B5, E6)
   * Loops every 2.4 seconds
   */
  startIncomingRingtone() {
    if (typeof window === "undefined") return;
    if (this.isIncomingPlaying) return;

    this.stopOutgoingRingback();
    this.isIncomingPlaying = true;

    const playRingtonePhrase = () => {
      if (!this.isIncomingPlaying) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Note frequencies (Hz) for elegant modern marimba/bell tone
      const notes = [
        { freq: 659.25, dur: 0.16, delay: 0.00, gain: 0.35, type: "sine" },   // E5
        { freq: 830.61, dur: 0.16, delay: 0.15, gain: 0.35, type: "sine" },   // G#5
        { freq: 987.77, dur: 0.18, delay: 0.30, gain: 0.38, type: "sine" },   // B5
        { freq: 1318.51, dur: 0.28, delay: 0.45, gain: 0.40, type: "triangle" }, // E6
        
        // Secondary harmonic echo
        { freq: 987.77, dur: 0.16, delay: 0.85, gain: 0.30, type: "sine" },   // B5
        { freq: 1318.51, dur: 0.35, delay: 1.00, gain: 0.42, type: "triangle" }, // E6
        { freq: 1661.22, dur: 0.25, delay: 1.15, gain: 0.28, type: "sine" },   // G#6 harmonic
      ];

      notes.forEach((n) => {
        this.playTone(n.freq, n.dur, n.type, n.gain, n.delay);
      });
    };

    // Play immediately and then interval
    playRingtonePhrase();
    this.incomingInterval = setInterval(playRingtonePhrase, 2200);
  }

  /**
   * Stop Incoming Call Ringtone
   */
  stopIncomingRingtone() {
    this.isIncomingPlaying = false;
    if (this.incomingInterval) {
      clearInterval(this.incomingInterval);
      this.incomingInterval = null;
    }
  }

  /**
   * Start Outgoing Call Dial / Ringback Tone (Caller side)
   * Dual frequency 440Hz + 480Hz international telephone ring tone (1.4s ring, 2.2s pause)
   */
  startOutgoingRingback() {
    if (typeof window === "undefined") return;
    if (this.isOutgoingPlaying) return;

    this.stopIncomingRingtone();
    this.isOutgoingPlaying = true;

    const playRingbackPulse = () => {
      if (!this.isOutgoingPlaying) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const duration = 1.3;
      // Dual tone frequencies: 440 Hz + 480 Hz standard ringback
      this.playTone(440, duration, "sine", 0.18, 0);
      this.playTone(480, duration, "sine", 0.18, 0);
    };

    // Play immediately and then repeat every 3.5s
    playRingbackPulse();
    this.outgoingInterval = setInterval(playRingbackPulse, 3500);
  }

  /**
   * Stop Outgoing Call Dial Tone
   */
  stopOutgoingRingback() {
    this.isOutgoingPlaying = false;
    if (this.outgoingInterval) {
      clearInterval(this.outgoingInterval);
      this.outgoingInterval = null;
    }
  }

  /**
   * Play Call Ended 3-beep Disconnect Sound
   */
  playCallEndTone() {
    if (typeof window === "undefined") return;
    this.stopAll();

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const beeps = [0, 0.2, 0.4];
    beeps.forEach((offset) => {
      this.playTone(480, 0.12, "sine", 0.22, offset);
    });
  }

  /**
   * Play Message Notification Sound (Single play guarantee, debounced & deduplicated)
   */
  playMessageNotification(msgKey = null) {
    if (typeof window === "undefined") return;

    const now = Date.now();
    // Strict debounce: never play more than once per 600ms
    if (this.lastMessageSoundTime && now - this.lastMessageSoundTime < 600) {
      return;
    }

    if (msgKey) {
      const cleanKey = String(msgKey).trim();
      if (!this.playedMessageSoundIds) {
        this.playedMessageSoundIds = new Set();
      }
      if (cleanKey && this.playedMessageSoundIds.has(cleanKey)) {
        return;
      }
      this.playedMessageSoundIds.add(cleanKey);
      if (this.playedMessageSoundIds.size > 200) {
        const first = this.playedMessageSoundIds.values().next().value;
        this.playedMessageSoundIds.delete(first);
      }
    }

    this.lastMessageSoundTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, startTime);
      osc.frequency.setValueAtTime(880, startTime + 0.07);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.24);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Stop all sounds and clean up
   */
  stopAll() {
    this.stopIncomingRingtone();
    this.stopOutgoingRingback();
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeNodes.clear();
  }
}

export const callSoundService = new CallSoundService();
export default callSoundService;
